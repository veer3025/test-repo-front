import { FC, useState ,useContext , useEffect ,useRef} from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Comment, Href, Reaction, Share, SvgPath } from "@/utils/constant";
import Image from "next/image";
import CommentSection from "@/Common/CreatePost/postPanel/CommonPostReact/CommentSection";
import ShareModal from "./ShareModal";
import { Spinner } from "reactstrap";
import {CreatePostPostPanelContext,CommonPostReactContext,PostComponentContext} from "@/Common/CreatePost/context/post_context"
import {PostPanelContextInterface,showCommentInterface,CommonPostReactContextInterface,PostComponentContextInterface} from '@/Common/CreatePost/types/postPanel'
import {reactOnPostAPI,getCommentsOnPostAPI,getUsersPostSharedWithAPI,ApiResponse} from "@/Common/CreatePost/client_api/api"
import SharedUserDropDown from "@/Common/CreatePost/postPanel/SharedUserDropDown"
import { toast } from "react-toastify";


interface CommonPostReactInterface {
  post_id:number;
  reaction:any;
  post_type:string
}

//constans begin
const showCommentInitial : showCommentInterface = {open:false,comments:[]};
//constatnts end

const CommonPostReact: FC<CommonPostReactInterface> = (props) => {
  //context data begin
  const {commonLikePanelLikesDataReload,setCommonLikePanelLikesDataReload,commonLikePanelCommentsDataReload,setCommonLikePanelCommentsDataReload} : PostComponentContextInterface = useContext(PostComponentContext);
  //context data end
  //props begin
  const {post_id,reaction,post_type} = props;
  //props end
  //context data begin
  const {reactions = [] , setPosts = undefined} : PostPanelContextInterface =  useContext(CreatePostPostPanelContext);
  //context data end
  const [drpdwnSharedUsrOpen,setDrpdwnSharedUsrOpen] = useState<boolean>(false);
  const [sharedUsersData,setSharedUsersData] = useState<any[]>([]);
  const [isSharedUsersLoading,setIsSharedUsersLoading] = useState<boolean>(false);
  const [isShowCommentLoading,setisShowCommentLoading] = useState<boolean>(false);
  const [showReaction, setShowReaction] = useState<boolean>(false);
  const [showComment, setShowComment] = useState<showCommentInterface>(showCommentInitial);
  // const [loadMoreComment,setLoadMoreComment] = useState<number>(0);
  // const loadMoreCommentRef = useRef<number>(0);
  //event handler begin
  const handleReactionOnPost = async(e:React.MouseEvent<HTMLAnchorElement|HTMLButtonElement>,imageName : string , remove_reaction : string) =>{
    try
    {
      const success_toast_message : string = remove_reaction == "N" ? "reacted on post" : 'reaction on post removed';
      //
      setShowReaction(false);
      setPosts && setPosts((prev)=>{
        return prev.map((record:any,index:number)=>{
          let _record : any = { ...record ,reaction_by_logged_usr:imageName};
          return (record.id == post_id) ? _record  : {...record};
        });
      });
      toast.success(success_toast_message);
      //
      let _data : any = {'reaction_code':imageName,'postId':post_id ,'remove_reaction' :remove_reaction};
      let response : ApiResponse =  await reactOnPostAPI(_data) as ApiResponse;
      if(response?.status == 200)
      {
        if(setCommonLikePanelLikesDataReload)
        {
          setCommonLikePanelLikesDataReload((prev)=>{
            return prev + 1;
          });
        }
      }
    }
    catch(error)
    {
      toast.error(`unable to perform action`);
    }
    finally{
    }
  }

  const loadComment = async (loadMore:string) : Promise<unknown> =>{
    let response : ApiResponse = {};
    let l_comment_id : number = 0;
    if(loadMore == 'Y' && showComment?.comments.length)
    {
      let comments : any = showComment?.comments ?? [];
      l_comment_id = comments[comments?.length - 1]?.id ?? 0;
    }

    try{
      let _data = { 'postId' : post_id , 'l_comment_id' : l_comment_id};
      response = await getCommentsOnPostAPI(_data) as ApiResponse;
    }
    catch(error:any)
    {
      throw new Error("Error Occure While Losing Comments");
    }
    finally{
    
    }
    return response;
  }
  
  const handleSetShowComment = async (load_comment = "N" ,loadMore = "N") =>{
    if(!showComment.open || load_comment == 'Y')
    {
      let _comments : any[] = [];
      setisShowCommentLoading(true);
      try{
        let response : ApiResponse = await loadComment(loadMore) as ApiResponse;
        if(response?.status == 200)
        {
          _comments = response.data?.comments ?? [];
          if(loadMore == 'Y' && !Boolean(_comments?.length) )
          {
            toast.error("No more comments on this post");
          }

          if(setCommonLikePanelCommentsDataReload)
          {
            setCommonLikePanelCommentsDataReload((prev)=>{
              return prev + 1;
            });
          }
        }
      }
      catch(error:any)
      {

      }
      finally{
        setisShowCommentLoading(false);
        setShowComment((prev)=>{
          if(loadMore == 'Y')
          {
            return { comments : [ ...prev.comments , ..._comments ], open : true};
          }
          else{
            return { comments : _comments, open : true};
          }
        });
      }
    }
    else
    {
      setShowComment((prev)=>{
        return showCommentInitial;
      });
    }
  } 

  const handleGetUsersPostSharedWith = async ()=>{
    let _usersData : any[] = [];
    let _data : {postId : number} = { postId : post_id };
    try{
      setIsSharedUsersLoading(true);
      let response : ApiResponse =  await getUsersPostSharedWithAPI(_data) as ApiResponse;
      if(response?.status == 200)
      {
        _usersData = response?.data?.usersData ?? [];
      }
    }
    catch(error)
    {

    }
    finally{
      setIsSharedUsersLoading(false);
    }
    setSharedUsersData(_usersData);
  }
  //event handler end

  //context data
  const context_data : CommonPostReactContextInterface = {
    post_id : post_id,
    showComment : showComment,
    setShowComment : setShowComment,
    isCommentLoading:isShowCommentLoading,
    handleSetShowComment:handleSetShowComment,
  };
  //context data


  //useEffect Begin
  useEffect(()=>{
    let isMounted : boolean = true;
    if(isMounted)
    {
      handleGetUsersPostSharedWith();
    }

    return ()=>{
      isMounted = false;
    }
  },[])
  //useEffect End
  return (
    <CommonPostReactContext.Provider value = {context_data}>
      <div className="post-react">
        <ul className="justify-content-between">
          <li className="react-btn">
            <div className="d-flex gap-2 align-items-center">
              { 
                Boolean(reaction) ?
                <button className="no_style_button" onClick={ (e:React.MouseEvent<HTMLAnchorElement|HTMLButtonElement>)=> { handleReactionOnPost(e,"","Y") } }>
                  <Image width={20} height={20} src={`${SvgPath}/emoji/${reaction}.svg`} alt="smiles"/>
                </button>
                :
                <DynamicFeatherIcon iconName="Smile" className="iw-18 ih-18" />
              }
              <a className={`react-click`} href={Href} onClick={() => setShowReaction(!showReaction)}>
                <span className={`${showReaction ? 'text-primary' : ''}`}>React</span>
              </a>
            </div>
            
            <div className={`react-box ${showReaction ? "show" : ""}`}>
              <ul>
                {reactions.map((data, index) => (
                  <li key={index} data-title={data.tittle}>
                    <a href={Href} onClick={ (e:React.MouseEvent<HTMLAnchorElement|HTMLButtonElement>)=> { handleReactionOnPost(e,data.imageName,"N") } }>
                      <img width={28} height={28} src={`${SvgPath}/emoji/${data.imageName}.svg`} alt="smiles"/>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </li>
          
          <li className={`comment-click ${isShowCommentLoading ? 'pointer_events_none' : ''}`}  onClick={()=>{ handleSetShowComment("N","N") } }>
            <a href={Href}>
              <DynamicFeatherIcon iconName="MessageSquare" className="iw-18 ih-18"/>
              { isShowCommentLoading ?  <Spinner className="d-inline-block" size = 'sm'></Spinner> : 'Comment' }
            </a>
          </li>

          {
            post_type == "PRIVATE" &&
            <>
              {
                Boolean(isSharedUsersLoading) 
                ? 
                  <Spinner color="primary" size="sm" type="grow"></Spinner>
                  // <Spinner className="d-inline-block" size = 'sm'></Spinner> 
                :
                  <>
                    {
                      (sharedUsersData?.length) &&
                      <li className={`share-with`}>
                        <SharedUserDropDown 
                          drpdwnSharedUsrOpen = {drpdwnSharedUsrOpen}
                          setDrpdwnSharedUsrOpen = {setDrpdwnSharedUsrOpen}
                          sharedUsersData = {sharedUsersData}
                        />
                      </li>
                    }
                  </>
              }
            </>
          }
        </ul>
      </div>  
      <CommentSection />
    </CommonPostReactContext.Provider>
  );
};

export default CommonPostReact;
