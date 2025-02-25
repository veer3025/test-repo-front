import { FC } from "react";
import { Media } from "reactstrap";
import { useContext } from "react";
import { Href, ImagePath, Like, Replay, Translate } from "@/utils/constant";
import {CommonPostReactContextInterface,PostCmntsNdReplyToCmntInterface,selectedCommentType} from "@/Common/CreatePost/types/postPanel"
import {CommonPostReactContext,PostCommentsAndReplyToCommentContext} from "@/Common/CreatePost/context/post_context"
import CommentsCommentSection from "@/Common/CreatePost/postPanel/CommonPostReact/CommentsCommentSection"
import HoverMessage from "@/Common/CreatePost/postPanel/HoverMessage";
//type begin
interface SubCommentProps {
  postCommentId:number,
  record:any,
  defaultSelectedComment:selectedCommentType
}

const defaultUserImagePath : string = '/assets/default/user.png';
//type end
const SubComment: FC<SubCommentProps> = (props) => {
  //props begin
  const {postCommentId,record,defaultSelectedComment} = props;
  //props end

  //context data begin
  const {selectedComment = defaultSelectedComment,setSelectedComment =  undefined , handleSetSelectedCommentId = undefined} : PostCmntsNdReplyToCmntInterface = useContext(PostCommentsAndReplyToCommentContext);
  //context data end

  //local data begin
  const popOverId : string = `SubComntPop_${record?.id}`;
  const useSrc : string = record?.cmnt_by_pfp ? record.cmnt_by_pfp : defaultUserImagePath;
  let replyToUserObj : {'id':number,'name':string,'email':string} = { id: 0 ,name: "" ,email:""};
  if(record?.post_comment_reply_tran_id)
  { 
    if(record?.reply_to_user_obj)
    {
      replyToUserObj.id = record?.reply_to_user_obj?.id ?? 0;
      replyToUserObj.name = record?.reply_to_user_obj?.full_name ?? "";
      replyToUserObj.email = record?.reply_to_user_obj?.email ?? "";
    }
  }
  //local data end
  return (
    <Media className="my-2">
      <a href={Href} className="user-img popover-cls bg-size blur-up lazyloaded" id={popOverId}>
        <img src={useSrc} className="img-fluid user-img" alt="user"/>
      </a>
      <HoverMessage placement={"right"} target={popOverId} image = {useSrc} user_name = {record?.cmnt_by_usr_name} email = {record?.email} country_name = { record?.country_name} />
      <Media body>
        <a href={Href}>
          <h5 className="user_name">
            {
              Boolean(record?.post_comment_reply_tran_id) && 
              <span className="text-info me-1" title={replyToUserObj.email}>
                @{replyToUserObj.name}
              </span>
            }
            {record?.cmnt_by_usr_name}
          </h5>
        </a>  
        <p>{ record?.reply }</p>
        {/* Start Here */}
        <ul className="comment-option">
          <li><a href={Href}>Like</a></li>
          <li>
            <a className={`a_reply ${ Boolean(selectedComment.id && (record?.id == selectedComment.id)) ? 'sub_reply_selected' : ''}`} href={Href} onClick = { (e:React.MouseEvent<HTMLAnchorElement>) => { handleSetSelectedCommentId && handleSetSelectedCommentId(e,{ id : record?.id, type:'SUB'} ) } } >
              Reply
            </a>
          </li>
        </ul>
        { 
          Boolean(selectedComment.id && (record?.id == selectedComment.id)) && <CommentsCommentSection defaultSelectedComment = {defaultSelectedComment} />
        }
      </Media>
      <div className="comment-time">
        <h6>{record?.created_text}</h6>
      </div>
    </Media>
  );
};

export default SubComment;
