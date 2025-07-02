/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { getQuickJS } from "quickjs-emscripten";
import { Arena } from "quickjs-emscripten-sync";
import { describe, expect, test } from "vitest";

import {
  getFunctionFingerprint,
  getFunctionFingerprintString,
  areFunctionsSame,
  FingerprintEventSystem
} from "./fingerprint";

describe("function fingerprinting", () => {
  test("generates consistent fingerprints for identical functions", () => {
    const fn1 = function testFunction() {
      console.log("test");
    };
    const fn2 = function testFunction() {
      console.log("test");
    };

    const fp1 = getFunctionFingerprint(fn1);
    const fp2 = getFunctionFingerprint(fn2);

    expect(fp1.hash).toBe(fp2.hash);
    expect(areFunctionsSame(fn1, fn2)).toBe(true);
  });

  test("generates different fingerprints for different functions", () => {
    const fn1 = function testFunction() {
      console.log("test1");
    };
    const fn2 = function testFunction() {
      console.log("test2");
    };

    const fp1 = getFunctionFingerprint(fn1);
    const fp2 = getFunctionFingerprint(fn2);

    expect(fp1.hash).not.toBe(fp2.hash);
    expect(areFunctionsSame(fn1, fn2)).toBe(false);
  });

  test("CRITICAL: same fingerprint for QuickJS function before and after marshaling", async () => {
    const ctx = (await getQuickJS()).newContext();
    const arena = new Arena(ctx, { isMarshalable: true });

    // Create a function in QuickJS and get it multiple times
    arena.evalCode(`
      globalThis.myTestFunction = function clickHandler() {
        console.log('button clicked');
        return 42;
      };
    `);

    // Get the function multiple times - these will be different JS objects
    const fn1 = arena.evalCode(`myTestFunction`);
    const fn2 = arena.evalCode(`myTestFunction`);
    const fn3 = arena.evalCode(`myTestFunction`);

    // Verify they are different objects (the original problem)
    expect(fn1).not.toBe(fn2);
    expect(fn2).not.toBe(fn3);

    // BUT their fingerprints should be identical!
    const fp1 = getFunctionFingerprintString(fn1);
    const fp2 = getFunctionFingerprintString(fn2);
    const fp3 = getFunctionFingerprintString(fn3);

    expect(fp1).toBe(fp2);
    expect(fp2).toBe(fp3);
    expect(areFunctionsSame(fn1, fn2)).toBe(true);
    expect(areFunctionsSame(fn2, fn3)).toBe(true);

    // Test the detailed fingerprint
    const detailed1 = getFunctionFingerprint(fn1);
    const detailed2 = getFunctionFingerprint(fn2);

    expect(detailed1.name).toBe(detailed2.name);
    expect(detailed1.source).toBe(detailed2.source);
    expect(detailed1.length).toBe(detailed2.length);
    expect(detailed1.hash).toBe(detailed2.hash);

    arena.dispose();
    ctx.dispose();
  });

  test("fingerprint-based event system solves addEventListener/removeEventListener", async () => {
    const ctx = (await getQuickJS()).newContext();
    const arena = new Arena(ctx, { isMarshalable: true });

    // Create event system
    const eventSystem = new FingerprintEventSystem();

    // Expose event system to QuickJS
    arena.expose({
      addEventListener: (event: string, handler: Function) => {
        return eventSystem.addEventListener(event, handler);
      },
      removeEventListener: (event: string, fingerprint: string) => {
        return eventSystem.removeEventListener(event, fingerprint);
      },
      dispatchEvent: (event: string) => {
        eventSystem.dispatchEvent(event);
        return eventSystem.getListenerCount(event);
      },
      getListenerCount: (event: string) => {
        return eventSystem.getListenerCount(event);
      }
    });

    // Test the complete flow in QuickJS
    const result = arena.evalCode(`
      // Define a function in QuickJS
      const myHandler = function clickHandler() {
        console.log('Button was clicked!');
      };

      // Add the listener and get the fingerprint
      const fingerprint = addEventListener('click', myHandler);
      const countAfterAdd = getListenerCount('click');

      // Remove using the fingerprint
      const removed = removeEventListener('click', fingerprint);
      const countAfterRemove = getListenerCount('click');

      // Return results
      ({
        fingerprint,
        countAfterAdd,
        removed,
        countAfterRemove
      });
    `);

    expect(result.countAfterAdd).toBe(1);
    expect(result.removed).toBe(true);
    expect(result.countAfterRemove).toBe(0);
    expect(typeof result.fingerprint).toBe("string");
    expect(result.fingerprint.length).toBeGreaterThan(0);

    arena.dispose();
    ctx.dispose();
  });

  test("manual fingerprint generation for user control", async () => {
    const ctx = (await getQuickJS()).newContext();
    const arena = new Arena(ctx, { isMarshalable: true });

    const eventSystem = new FingerprintEventSystem();

    // Expose fingerprint utilities to QuickJS
    arena.expose({
      addEventListener: (
        event: string,
        handler: Function,
        customFingerprint?: string
      ) => {
        return eventSystem.addEventListener(event, handler, customFingerprint);
      },
      removeEventListener: (event: string, fingerprint: string) => {
        return eventSystem.removeEventListener(event, fingerprint);
      },
      getListenerCount: (event: string) => {
        return eventSystem.getListenerCount(event);
      },
      // Expose fingerprint generation function
      generateFingerprint: (fn: Function) => {
        return getFunctionFingerprintString(fn);
      }
    });

    const result = arena.evalCode(`
      const myHandler = function mySpecialHandler() {
        return 'clicked';
      };

      // User generates their own fingerprint
      const userFingerprint = generateFingerprint(myHandler);
      
      // User can also create a custom fingerprint
      const customFingerprint = 'my-custom-id-' + myHandler.name;

      // Add with auto-generated fingerprint
      const autoFP = addEventListener('click', myHandler);
      
      // Add with custom fingerprint  
      const customFP = addEventListener('scroll', myHandler, customFingerprint);

      ({
        userFingerprint,
        customFingerprint,
        autoFP,
        customFP,
        autoSameAsUser: autoFP === userFingerprint,
        customSameAsProvided: customFP === customFingerprint
      });
    `);

    expect(result.autoSameAsUser).toBe(true);
    expect(result.customSameAsProvided).toBe(true);
    expect(result.userFingerprint).toBe(result.autoFP);
    expect(result.customFingerprint).toBe(result.customFP);

    arena.dispose();
    ctx.dispose();
  });

  test("event system handles multiple listeners and events", async () => {
    const ctx = (await getQuickJS()).newContext();
    const arena = new Arena(ctx, { isMarshalable: true });

    const eventSystem = new FingerprintEventSystem();
    const dispatchLog: string[] = [];

    arena.expose({
      addEventListener: (event: string, handler: Function) => {
        return eventSystem.addEventListener(event, handler);
      },
      removeEventListener: (event: string, fingerprint: string) => {
        return eventSystem.removeEventListener(event, fingerprint);
      },
      dispatchEvent: (event: string) => {
        // Capture dispatch for testing
        dispatchLog.push(`Dispatching ${event}`);
        eventSystem.dispatchEvent(event);
        return eventSystem.getListenerCount(event);
      },
      getListenerCount: (event: string) => {
        return eventSystem.getListenerCount(event);
      },
      log: (message: string) => {
        dispatchLog.push(message);
      }
    });

    arena.evalCode(`
      // Create multiple handlers
      const handler1 = function clickHandler1() { log('Handler 1 called'); };
      const handler2 = function clickHandler2() { log('Handler 2 called'); };
      const handler3 = function scrollHandler() { log('Scroll handler called'); };

      // Add listeners
      const fp1 = addEventListener('click', handler1);
      const fp2 = addEventListener('click', handler2);  
      const fp3 = addEventListener('scroll', handler3);

      // Dispatch events
      dispatchEvent('click');   // Should call handler1 and handler2
      dispatchEvent('scroll');  // Should call handler3

      // Remove one click handler
      removeEventListener('click', fp1);
      
      // Dispatch again
      dispatchEvent('click');   // Should only call handler2
    `);

    expect(dispatchLog).toEqual([
      "Dispatching click",
      "Handler 1 called",
      "Handler 2 called",
      "Dispatching scroll",
      "Scroll handler called",
      "Dispatching click",
      "Handler 2 called"
    ]);

    arena.dispose();
    ctx.dispose();
  });
});
