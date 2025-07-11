import "./style.css";
type Props = {};

function LoadingBase({}: Props) {
  return (
    <div
      className="flex justify-center items-center h-screen w-full fixed top-0 left-0 bg-black bg-opacity-30"
      style={{ zIndex: 999999, pointerEvents: "auto" }}
    >
      <div className="loader bg-chat-gradient w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px]" />
    </div>
  );
}

export default LoadingBase;
