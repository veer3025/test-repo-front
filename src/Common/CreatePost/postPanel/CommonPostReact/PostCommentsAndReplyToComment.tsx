
import { FC, useState ,useContext} from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import MainComment from "./MainComment";
import { LoadMoreReplies } from "@/utils/constant";
import { Href } from "@/utils/constant/index";
import {showCommentInterface} from '@/Common/CreatePost/types/postPanel'
import {CommonPostReactContextInterface,PostCmntsNdReplyToCmntInterface,selectedCommentType} from "@/Common/CreatePost/types/postPanel"
import {CommonPostReactContext,PostCommentsAndReplyToCommentContext} from "@/Common/CreatePost/context/post_context"
//interface begin
interface PostCommentsAndReplyToCommentInterface {
  
}
//interface end
const defaultSelectedComment : selectedCommentType = {id: 0 , type:''};
const PostCommentsAndReplyToComment  : React.FC<PostCommentsAndReplyToCommentInterface> = (props) =>{
  //context data begin
  const {post_id,showComment,handleSetShowComment,isCommentLoading} : CommonPostReactContextInterface = useContext(CommonPostReactContext);
  //context data begin
 
  //state begin
  const [selectedComment,setSelectedComment] = useState<selectedCommentType>(defaultSelectedComment);
  //state end

  //local data begin 
  const comments : any = showComment?.comments ?? [];
  //local data end

  //event handler begin
  const loadMoreComments = () =>{
    handleSetShowComment && handleSetShowComment("Y","Y");
  }

  const handleSetSelectedCommentId = (e:React.MouseEvent<HTMLAnchorElement>,selectedComment : selectedCommentType = defaultSelectedComment) =>{
    // console.log(selectedComment);
    if(setSelectedComment)
    {
      let _selectedComment : selectedCommentType;
      setSelectedComment((prev)=>{
        if(prev && selectedComment?.id == prev.id)
        {
          _selectedComment = defaultSelectedComment;
        }
        else
        {
          _selectedComment = { ...defaultSelectedComment , ...selectedComment};
        }
        return _selectedComment;
      });
    }
  }
  //event handler end

  //context data begin
  let context_data : PostCmntsNdReplyToCmntInterface = {
    selectedComment : selectedComment,
    setSelectedComment : setSelectedComment,
    handleSetSelectedCommentId : handleSetSelectedCommentId,
  };
  //context data end
  return(
    <PostCommentsAndReplyToCommentContext.Provider value={context_data}>
      <div className={`comments d-block`}>
        <div className="main-comment">
          {
            Boolean(comments?.length) &&
            comments.map((record:any,index:number)=>{
              return(
                <MainComment defaultSelectedComment = {defaultSelectedComment} key ={ record.id} comment_record = {record} id={`Comment ${record.id}`} />
              );
            })
          }
          <div className="my-2">
            {
              Boolean(comments?.length) ?
              <>
                {
                  comments?.length >= 5 &&
                  <a className="no_style_button loader d-flex align-items-center justify-content-center" onClick = { () => {loadMoreComments()} } >
                    <span className={`load_more_btn ${isCommentLoading ? 'rotate' : ''}`} >
                      <DynamicFeatherIcon iconName="RotateCcw" className="iw-15 ih-15" />
                    </span>
                    load more comments
                  </a>
                }
              </>
              :
              <div className="text-center text-danger fw-bold">No comments found</div>
            }
          </div>
        </div>
      </div>
    </PostCommentsAndReplyToCommentContext.Provider>
  );
}
export default PostCommentsAndReplyToComment;