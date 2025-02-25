import CommonLikePanel from "@/Common/CreatePost/postPanel/CommonLikePanel";
import CommonPostReact from "@/Common/CreatePost/postPanel/CommonPostReact";
import CommonUserHeading from "@/Common/CreatePost/postPanel/CommonUserHeading";
import DetailBox from "@/Common/CreatePost/postPanel/DetailBox";
import { FC, useContext ,useState } from "react";
import {CreatePostPostPanelContext,PostComponentContext} from "@/Common/CreatePost/context/post_context"
import {PostPanelContextInterface,PostComponentContextInterface} from '@/Common/CreatePost/types/postPanel'
//interface begin
interface postComponentInterFace {
  post:any, 
}
//interface end
const PostComponent: FC<postComponentInterFace> = (props) => {
  //state begin
  const [commonLikePanelLikesDataReload,setCommonLikePanelLikesDataReload] = useState<number>(0);
  const [commonLikePanelCommentsDataReload,setCommonLikePanelCommentsDataReload] = useState<number>(0);
  //state end

  //props begin
  const {post} = props;
  //props end  
  
  //context data begin
  const {defaultUserImagePath = ""} : PostPanelContextInterface =  useContext(CreatePostPostPanelContext);
  //context data end

  //local data begin
  const image : string = Boolean(post.post_by_user_pfp) ? post.post_by_user_pfp : defaultUserImagePath;
  //local data end
  //console.log(post);

  //context data begin
  let context_data : PostComponentContextInterface = {
    commonLikePanelLikesDataReload : commonLikePanelLikesDataReload,
    setCommonLikePanelLikesDataReload :setCommonLikePanelLikesDataReload,
    commonLikePanelCommentsDataReload : commonLikePanelCommentsDataReload,
    setCommonLikePanelCommentsDataReload : setCommonLikePanelCommentsDataReload,
  }
  //context data end
  return (
    <PostComponentContext.Provider value = {context_data}>
      <div className="post-wrapper col-grid-box section-t-space d-block">
        <CommonUserHeading post = {post} image={image} id={`Pst-${post.id}`} />
        <div className="post-details">
          <DetailBox post = {post} />
          <CommonLikePanel post_id = {post.id}/>
          <CommonPostReact post_type = { post?.type } post_id = {post.id} reaction = {post.reaction_by_logged_usr}/>
        </div>
      </div>
    </PostComponentContext.Provider>
  );
};

export default PostComponent;
