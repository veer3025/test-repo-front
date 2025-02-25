import { Input } from "reactstrap";
const FeelingAndActivity = () => {
  return (
    <div className="">
      <Input
        style={{ fontSize: '0.8rem' }}
        id="exampleText"
        name="text"
        type="text"
        placeholder="How Are You Feeling?"
      />
    </div>
  );
};

export default FeelingAndActivity;