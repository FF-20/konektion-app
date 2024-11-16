const MovingDivs = () => {
  return (
    // <div className="relative flex justify-between w-full h-full ">
    //   <div className="absolute left-0 top-1/2 transform -translate-y-1/2 animate-move-left">
    //     Left Div
    //   </div>
    //   <div className="absolute right-0 top-1/2 transform -translate-y-1/2 animate-move-right">
    //     Right Div
    //   </div>
    // </div>
    <div className="relative w-full h-full overflow-hidden">
    <div className="absolute top-1/2 transform -translate-y-1/2 animate-move-left text-white p-4 rounded-md">
      <img src="/left-hand.png" alt="left-hand" />
    </div>
    <div className="absolute top-1/2 transform -translate-y-1/2 animate-move-right text-white p-4 rounded-md">
    <img src="/right-hand.png" alt="right-hand" />
    </div>
  </div>
  );
};

export default MovingDivs;

