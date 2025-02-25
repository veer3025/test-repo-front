import { Comment, Share, SvgPath } from "@/utils/constant";
import Image from "next/image";
import { FC, useEffect , useContext , useState} from "react";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { Spinner } from "reactstrap";
import {PostComponentContext} from "@/Common/CreatePost/context/post_context"
import {PostComponentContextInterface} from '@/Common/CreatePost/types/postPanel'
import {getPostLikesDetailsAPi,ApiResponse,getPostCommentsDetailsAPi} from "@/Common/CreatePost/client_api/api"
interface CommonLikePanelInterface {
  post_id:number;
}

const request_to_like_reaction_code : string = "042";

const CommonLikePanel: FC<CommonLikePanelInterface> = (props) => {
  //context data begin
  const {commonLikePanelLikesDataReload,setCommonLikePanelLikesDataReload,commonLikePanelCommentsDataReload,setCommonLikePanelCommentsDataReload} : PostComponentContextInterface = useContext(PostComponentContext);
  //context data end

  //state begin
  const [isLikesDataLoading,setIsLikesDataLoading] = useState<boolean>(false);
  const [isCommentsDataLoading,setIsCommentsDataLoading] = useState<boolean>(false);
  const [likesData,setLikesData] = useState<any>({});//total_likes,reaction_code_by_logged_in_user
  const [commentsData,setCommentsData] = useState<any>({});
  //state end

  //props begin
  const {post_id} = props;
  //props end

  //local data begin
  const reaction : string = likesData?.reaction_code_by_logged_in_user ?? "";
  const total_likes_on_post : number = likesData?.total_likes ?? 0;
  let _total_likes_on_post : number = reaction ? total_likes_on_post - 1 : total_likes_on_post;
  let h_like_text : string = "";
  if(reaction)
  {
    h_like_text = h_like_text + "you";
    if(_total_likes_on_post)
    {
      h_like_text = h_like_text + " +";
    }
  }

  if(_total_likes_on_post)
  {
    h_like_text = h_like_text + ` ${_total_likes_on_post} `;
    if(reaction)
    {
      h_like_text = h_like_text + ` other`;
    }
    else
    {
      h_like_text = h_like_text + ` reaction`;
    }
  }
  h_like_text = h_like_text?.trim();

  //local data end
  //useEffect Begin
  useEffect(()=>{
    let isMounted : boolean = true;
    const loadData = async () => {
      let _likesData :any = {};
      try{
        setIsLikesDataLoading(true);
        let _data = {postId:post_id};
        let response : ApiResponse = await getPostLikesDetailsAPi(_data) as ApiResponse;
        if(response?.status == 200)
        {
          _likesData = response.data.likesData;
          // console.log(_likesData);
        }
      }
      catch(error:any)
      {
        
      }
      finally{
        setIsLikesDataLoading(false);
        setLikesData(_likesData);
      }
    }

    if(isMounted)
    {
      loadData();
    }
    return ()=>{
      isMounted = false;
    }
  },[commonLikePanelLikesDataReload]);

  useEffect(()=>{
    let isMounted : boolean = true;
    const loadData = async () => {
      let _commentsData :any = {};
      try{
        setIsCommentsDataLoading(true);
        let _data = {postId:post_id};
        let response : ApiResponse = await getPostCommentsDetailsAPi(_data) as ApiResponse;
        if(response?.status == 200)
        {
          _commentsData = response.data.commentsData;
        }
      }
      catch(error:any)
      {
        
      }
      finally{
        setIsCommentsDataLoading(false);
        setCommentsData(_commentsData);
      }
    }

    if(isMounted)
    {
      loadData();
    }
    return ()=>{
      isMounted = false;
    }
  },[commonLikePanelCommentsDataReload]);
  //useEffect end

  return (
    <div className="like-panel">
      <div className="left-emoji">
        {
          isLikesDataLoading
          ?
          <Spinner className="d-inline-block" size = 'sm'></Spinner>
          :
          <>
            {
              Boolean(reaction) &&
              <img width={16} height={16} src={`${SvgPath}/emoji/${reaction}.svg`} alt="smiles"/>
            }
            <h6>{h_like_text ? h_like_text : 'React on post'}</h6>
            {
              !Boolean(h_like_text) &&
              <img className = "ms-1" width={16} height={16} src={`${SvgPath}/emoji/${request_to_like_reaction_code}.svg`} alt="smiles"/>
            }
          </>
        }
      </div>
      <div className="right-stats">
        <ul>
          <li>
            {
              isCommentsDataLoading 
              ?
              <Spinner className="" size = 'sm'></Spinner>
              :
              <h5>
                <DynamicFeatherIcon iconName="MessageSquare" className="iw-16 ih-16"/>
                <span>{commentsData?.total_comments_on_post ?? 0}</span>
              </h5>
            }
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CommonLikePanel;
