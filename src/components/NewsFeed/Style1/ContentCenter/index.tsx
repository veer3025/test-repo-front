// MTak Begin
import CreatePost from "@/Common/CreatePost";
import PostPanel from "@/Common/CreatePost/postPanel/PostPanel";
import { FC ,useState ,useEffect} from "react";
// import PostPanel from "./PostPanel";
const ContentCenter: FC = () => {
  const [postPanelReset,setPostPanelReset] = useState<number>(0);
  // console.log(postPanelReset);
  return (
    <div className="content-center">
      <CreatePost setPostPanelReset = {setPostPanelReset} />
      <div className="overlay-bg" />
      <PostPanel key = { `PstPnl${postPanelReset}` } setPostPanelReset = {setPostPanelReset} />
    </div>
  );
};
export default ContentCenter;
