package app

// https://github.com/plutov/echo-logrus with some modifications
// MIT License
// Copyright (c) 2017 Alex Pliutau

import (
	"io"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
	"github.com/sirupsen/logrus"
)

// Logrus : implement Logger
type Logger struct{}

var _ echo.Logger = new(Logger)

// GetEchoLogger for e.Logger
func GetEchoLogger() *Logger {
	return &Logger{}
}

// Level returns logger level
func (l *Logger) Level() log.Lvl {
	switch logrus.StandardLogger().Level {
	case logrus.DebugLevel:
		return log.DEBUG
	case logrus.WarnLevel:
		return log.WARN
	case logrus.ErrorLevel:
		return log.ERROR
	case logrus.InfoLevel:
		return log.INFO
	default:
		l.Panic("Invalid level")
	}
	return log.OFF
}

// SetHeader is a stub to satisfy interface
// It's controlled by Logger
func (l *Logger) SetHeader(_ string) {}

// SetPrefix It's controlled by Logger
func (l *Logger) SetPrefix(s string) {}

// Prefix It's controlled by Logger
func (l *Logger) Prefix() string {
	return ""
}

// SetLevel set level to logger from given log.Lvl
func (l *Logger) SetLevel(lvl log.Lvl) {
	switch lvl {
	case log.DEBUG:
		logrus.SetLevel(logrus.DebugLevel)
	case log.WARN:
		logrus.SetLevel(logrus.WarnLevel)
	case log.ERROR:
		logrus.SetLevel(logrus.ErrorLevel)
	case log.INFO:
		logrus.SetLevel(logrus.InfoLevel)
	default:
		l.Panic("Invalid level")
	}
}

// Output logger output func
func (l *Logger) Output() io.Writer {
	return logrus.StandardLogger().Out
}

// SetOutput change output, default os.Stdout
func (l *Logger) SetOutput(w io.Writer) {
	logrus.SetOutput(w)
}

// Printj print json log
func (l *Logger) Printj(j log.JSON) {
	logrus.WithFields(logrus.Fields(j)).Print()
}

// Debugj debug json log
func (l *Logger) Debugj(j log.JSON) {
	logrus.WithFields(logrus.Fields(j)).Debug()
}

// Infoj info json log
func (l *Logger) Infoj(j log.JSON) {
	logrus.WithFields(logrus.Fields(j)).Info()
}

// Warnj warning json log
func (l *Logger) Warnj(j log.JSON) {
	logrus.WithFields(logrus.Fields(j)).Warn()
}

// Errorj error json log
func (l *Logger) Errorj(j log.JSON) {
	logrus.WithFields(logrus.Fields(j)).Error()
}

// Fatalj fatal json log
func (l *Logger) Fatalj(j log.JSON) {
	logrus.WithFields(logrus.Fields(j)).Fatal()
}

// Panicj panic json log
func (l *Logger) Panicj(j log.JSON) {
	logrus.WithFields(logrus.Fields(j)).Panic()
}

// Print string log
func (l *Logger) Print(i ...interface{}) {
	logrus.Print(i...)
}

// Debug string log
func (l *Logger) Debug(i ...interface{}) {
	logrus.Debug(i...)
}

// Info string log
func (l *Logger) Info(i ...interface{}) {
	logrus.Info(i...)
}

// Warn string log
func (l *Logger) Warn(i ...interface{}) {
	logrus.Warn(i...)
}

// Error string log
func (l *Logger) Error(i ...interface{}) {
	logrus.Error(i...)
}

// Fatal string log
func (l *Logger) Fatal(i ...interface{}) {
	logrus.Fatal(i...)
}

// Panic string log
func (l *Logger) Panic(i ...interface{}) {
	logrus.Panic(i...)
}

// Printf print json log
func (l *Logger) Printf(format string, args ...interface{}) {
	logrus.Printf(format, args...)
}

// Debugf debug json log
func (l *Logger) Debugf(format string, args ...interface{}) {
	logrus.Debugf(format, args...)
}

// Infof info json log
func (l *Logger) Infof(format string, args ...interface{}) {
	logrus.Infof(format, args...)
}

// Warnf warning json log
func (l *Logger) Warnf(format string, args ...interface{}) {
	logrus.Warnf(format, args...)
}

// Errorf error json log
func (l *Logger) Errorf(format string, args ...interface{}) {
	logrus.Errorf(format, args...)
}

// Fatalf fatal json log
func (l *Logger) Fatalf(format string, args ...interface{}) {
	logrus.Fatalf(format, args...)
}

// Panicf panic json log
func (l *Logger) Panicf(format string, args ...interface{}) {
	logrus.Panicf(format, args...)
}

// Hook is a function to process middleware.
func (l *Logger) Hook() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			req := c.Request()
			res := c.Response()
			start := time.Now()
			if err := next(c); err != nil {
				c.Error(err)
			}
			stop := time.Now()

			logrus.WithFields(map[string]interface{}{
				"time_rfc3339":  time.Now().Format(time.RFC3339),
				"remote_ip":     c.RealIP(),
				"host":          req.Host,
				"uri":           req.RequestURI,
				"method":        req.Method,
				"path":          req.URL.Path,
				"referer":       req.Referer(),
				"user_agent":    req.UserAgent(),
				"status":        res.Status,
				"latency":       stop.Sub(start).Microseconds(),
				"latency_human": stop.Sub(start).String(),
				"bytes_in":      req.ContentLength,
				"bytes_out":     res.Size,
			}).Info("Handled request")

			return nil
		}
	}
}
