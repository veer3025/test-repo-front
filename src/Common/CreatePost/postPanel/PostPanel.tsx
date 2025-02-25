// Mtak Begin
import { useEffect,useRef,useState} from "react";
import PostComponent from "@/Common/CreatePost/postPanel/PostComponent";
import ShowMorePostIcon from "@/Common/ShowMorePostIcon/ShowMorePostIcon";
import { styleOneMoreComponent } from "@/Data/NewsFeed";
import DynamicFeatherIcon from "@/Common/DynamicFeatherIcon";
import { toast } from "react-toastify";
import { Button } from "reactstrap";
import { getPostsAPI } from "@/Common/CreatePost/client_api/api"
import "@/Common/CreatePost/css/post_panel.css"
import { ApiResponse } from "@/layout/client_api/chat_box_common/api";
import {CreatePostPostPanelContext} from "@/Common/CreatePost/context/post_context"
import {PostPanelContextInterface} from '@/Common/CreatePost/types/postPanel'
interface PostPanelInterface {
  setPostPanelReset : React.Dispatch<React.SetStateAction<number>>
}
//constatnts begin
const reactions = [
  { tittle: "smile", imageName: "040" },
  { tittle: "love", imageName: "113" },
  { tittle: "cry", imageName: "027" },
  { tittle: "wow", imageName: "052" },
  { tittle: "angry", imageName: "039" },
  { tittle: "haha", imageName: "042" },
];
const defaultUserImagePath : string = '/assets/default/user.png';
const postsFileBasePath : string = '/images/user_posts';
//constatnts begin
const PostPanel: React.FC<PostPanelInterface> = (props) => {
  //props begin
  const {setPostPanelReset} = props;
  //props end

  //state begin
  const [isLoading,setIsLoading] = useState(false);
  const [posts,setPosts] = useState<any[]>([]);
  //state end

  //event handler begin
  const handleLoadMorePosts = async ( loadMore : string) =>{
    let _posts : any[] = [];
    let l_post_id : number = 0;
    try{
      setIsLoading(true);
      if(posts.length && loadMore == "Y")
      {
        l_post_id = posts[posts.length - 1]?.id ?? 0;
      }
      let _data : any = { l_post_id : l_post_id };
      let response =  await getPostsAPI(_data) as ApiResponse;
      if(response?.status == 200)
      {
        _posts = response?.data?.posts ?? [];
      }
    }
    catch(error : any)
    {
      //console.log(error);
    }
    finally{
      if(loadMore == "Y")
      {
        if(_posts?.length)
        {
          setPosts((prev)=>{
            return [...prev , ..._posts];
          });
        }
        else{
          toast.error("You reached at the end");
        }
      }
      else
      {
        setPosts(_posts);
      }
      setIsLoading(false);
    }
  }
  //event handler end

  //useEffectBegin
  useEffect(()=>{
    let isMounted : boolean = true;
    const loadData = async () =>{
      await handleLoadMorePosts("N");
    }

    if(isMounted && !isLoading)
    { 
      loadData();
    }
    return ()=>{
      isMounted = false;
    }
  },[])
  //useEffectEnd
  
  //context data begin
  const contextData : PostPanelContextInterface= {
    defaultUserImagePath : defaultUserImagePath,
    postsFileBasePath : postsFileBasePath,
    posts : posts,
    reactions : reactions,
    setPosts : setPosts,
    setPostPanelReset:setPostPanelReset
  };
  //context data end
  return (
    <CreatePostPostPanelContext.Provider value = { contextData }>
      <div id="DashBoardPostPanel" className="post-panel infinite-loader-sec section-t-space">
        
        {
          isLoading == false && 
          <div className="text-center loadMoreDiv" title = "Refresh Post Panel">
            <Button color="link" onClick = { () => { setPostPanelReset((prev)=>{ return prev + 1;}) } } style={{lineHeight : 0}}>
              <span style={{ fontSize : "1rem" }}>Refresh</span>
            </Button>
          </div>
        }

        {
          posts.map((record,index)=>{
            return <PostComponent post = {record} key = {record.id} />;
          })
        }

        <div className="text-center loadMoreDiv" title = "Load More Posts">
          <button className={`no_style_button load_more_btn ${isLoading ? 'rotate' : ''}`} onClick = { () => { handleLoadMorePosts("Y") } } >
            <DynamicFeatherIcon iconName="RotateCcw" className="icon-theme iw-25 ih-25"/>
          </button>
        </div>
      </div>
    </CreatePostPostPanelContext.Provider>
  );
};

export default PostPanel;
