import { Href, ImagePath, Replay, Translate ,SvgPath} from "@/utils/constant";
import { FC, useContext ,useEffect ,useState} from "react";
import { Media } from "reactstrap";
import { toast } from "react-toastify";
import Image from "next/image";
import { Like } from "@/utils/constant/index";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import {CreatePostPostPanelContext,PostCommentsAndReplyToCommentContext,CommonPostReactContext} from "@/Common/CreatePost/context/post_context"
import {PostPanelContextInterface,PostCmntsNdReplyToCmntInterface,selectedCommentType,CommonPostReactContextInterface, showCommentInterface} from '@/Common/CreatePost/types/postPanel'
import HoverMessage from "@/Common/CreatePost/postPanel/HoverMessage";
import SubComment from "./SubComment";
import { ApiResponse , getCommentsReplyAPI , reactOnCommentAPI} from "@/Common/CreatePost/client_api/api";
import CommentsCommentSection from "@/Common/CreatePost/postPanel/CommonPostReact/CommentsCommentSection"
//type begin
interface MainCommentProps {
  id?:string;
  comment_record?:any;
  defaultSelectedComment:selectedCommentType,
}

//type end
const MainComment: FC<MainCommentProps> = (props) => {

  //props begin
  const { id ,comment_record ,defaultSelectedComment} = props;
  //props end

  //context_data begin
  const {post_id = 0 , setShowComment = undefined} : CommonPostReactContextInterface = useContext(CommonPostReactContext);
  const {selectedComment = defaultSelectedComment ,setSelectedComment =  undefined , handleSetSelectedCommentId = undefined } : PostCmntsNdReplyToCmntInterface = useContext(PostCommentsAndReplyToCommentContext);
  const {defaultUserImagePath = "" , reactions = []} : PostPanelContextInterface =  useContext(CreatePostPostPanelContext);
  //context_data end

  //state begin
  const [showReaction, setShowReaction] = useState<boolean>(false);
  const [subComments,setSubComments] = useState<any[]>([]);
  //state end

  //local_data begin
  const user_image : string = Boolean(comment_record.cmnt_by_pfp) ? comment_record.cmnt_by_pfp : defaultUserImagePath;
  const commentId : number = comment_record?.id;
  const reaction : string = comment_record?.reaction_by_logged_usr ?? "";
  //local_data end

  //event handler begin
  const loadCommentsReply = async () =>{
    let _sub_comments : any[] = [];
    try{
      let _data = {'commentId':commentId,'l_comment_id':0};
      let response : ApiResponse = await getCommentsReplyAPI(_data) as ApiResponse;
      if(response?.status == 200)
      {
        _sub_comments = response?.data?.comments ?? [];
      }
      // console.log(_sub_comments);
    }
    catch(error:any)
    {

    }
    finally{
      setSubComments(_sub_comments);
    } 
  }

  const handleReactionOnComment = async(e:React.MouseEvent<HTMLAnchorElement|HTMLButtonElement>,imageName : string , remove_reaction : string) =>{
    e.stopPropagation();
    try
    {
      const success_toast_message : string = remove_reaction == "N" ? "reacted on comment" : 'reaction on comment removed';
      //
      setShowReaction(false);
      setShowComment && setShowComment((prev:any)=>{
        let _comments:any[] = (prev?.comments ?? []).map((record:any,index:number)=>{
          let _record : any = { ...record ,reaction_by_logged_usr:imageName};
          return (record.id == commentId) ? _record  : {...record};
        });
        return {...prev , comments : _comments};
      });
      toast.success(success_toast_message);
      //
      let _data : any = {'reaction_code':imageName,'commentId':commentId ,postId : post_id,'remove_reaction' :remove_reaction};
      let response : ApiResponse =  await reactOnCommentAPI(_data) as ApiResponse;
      if(response?.status == 200)
      {
        //do nothing
      }
      else
      {
        throw new Error("BAD status code");
      }
    }
    catch(error)
    {
      toast.error(`unable to perform action`);
    }
    finally{
    }
  }
  //event handler end

  //useEffect begin
  useEffect(()=>{
    let isMounted : boolean = true;
    if(isMounted)
    {
      //Staart here
      //loadCommentsReply();
    }
    return ()=>{
      isMounted = false;
    }
  },[])
  //useEffect end

  // console.log(reactions);
  return (
    <>
      <Media className="my-3">
        <a href={Href} className="user-img popover-cls bg-size blur-up lazyloaded" id={`CmntPopover-${comment_record?.id}`}>
          <img src={user_image} className="img-fluid user-img" alt="user"/>
        </a>
        <HoverMessage placement={"right"} target={`CmntPopover-${comment_record?.id}`} image = {user_image} user_name = {comment_record?.cmnt_by_usr_name} email = {comment_record?.email} country_name = { comment_record.country_name} />
        <Media body>
          <a href={Href}>
            <h5 className = "user_name" title={comment_record?.cmnt_by_usr_name}>{comment_record?.cmnt_by_usr_name}</h5>
          </a>
          <p>{comment_record?.comment}</p>
          {/* Start Here */}
          <ul className="comment-option">
            <li className="react-btn">
              <div className="d-flex gap-1 align-items-center">
                { 
                  Boolean(reaction) ?
                  <button className="no_style_button" onClick={ (e:React.MouseEvent<HTMLAnchorElement|HTMLButtonElement>)=> { handleReactionOnComment(e,"","Y") } }>
                    <Image width={16} height={16} src={`${SvgPath}/emoji/${reaction}.svg`} alt="smiles"/>
                  </button>
                  :
                  <DynamicFeatherIcon iconName="Smile" className="iw-16 ih-16" />
                }
                <a className={`react-click`} href={Href} onClick={() => setShowReaction(!showReaction)}>
                  <span className={`${showReaction ? 'text-primary' : 'text-secondary'}`}>React</span>
                </a>
              </div>
              
              <div className={`react-box ${showReaction ? "show" : ""}`}>
                <ul>
                  {reactions.map((data, index) => (
                    <li key={index} data-title={data.tittle}>
                      <a href={Href} onClick={ (e:React.MouseEvent<HTMLAnchorElement|HTMLButtonElement>)=> { handleReactionOnComment(e,data.imageName,"N") } }>
                        <img width={28} height={28} src={`${SvgPath}/emoji/${data.imageName}.svg`} alt="smiles"/>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
            {/* Start here */}
            {/* <li>
              <a className={`a_reply ${ Boolean(selectedComment.id && (comment_record?.id == selectedComment.id)) ? 'sub_reply_selected' : ''}`} href={Href} onClick = { (e:React.MouseEvent<HTMLAnchorElement>) => { handleSetSelectedCommentId && handleSetSelectedCommentId(e,{ id : comment_record?.id, type:'MAIN'} ) } } >
                Reply
              </a>
            </li> */}
          </ul>
          {/* { 
            Boolean(selectedComment.id && (comment_record?.id == selectedComment.id)) && <CommentsCommentSection defaultSelectedComment = {defaultSelectedComment} />
          } */}
        </Media>
        <div className="comment-time">
          <h6>{comment_record?.created_text}</h6>
        </div>
      </Media>

      {/* Start Here */}
      {/* {
        Boolean(subComments?.length) &&
        <div className="sub-comments ms-3">
          {
            subComments.map((record:any,index:number)=>{
              return(
                <SubComment key ={record?.id} 
                  defaultSelectedComment = {defaultSelectedComment}
                  postCommentId = {comment_record?.id}       
                  record = {record}
                />
              );
            })
          }
        </div>
      } */}
    </>
  );
};

export default MainComment;
