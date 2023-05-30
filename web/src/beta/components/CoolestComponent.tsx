const CoolestComponent = () => {
  function CoolFunction(a: number, b: number) {
    return a + b;
  }
  console.log(CoolFunction(1, 2));
  return <div>CoolestComponent</div>;
};

export default CoolestComponent;
