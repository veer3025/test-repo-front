// MTak Begin
import axios from "axios";
export const commonAPIPath : string = `${process.env.NEXT_PUBLIC_API_URL as string}/auth`;
export interface ApiResponse {
  status?:number,
  error?:string,
  message?:string,
  data?:any
}

export const getTagPostUsersAPI = async (_data:any) : Promise<unknown>=>{
  let response: ApiResponse = {};
  let url : string | undefined = `${commonAPIPath}/post/get-users`;
  try{
    let _response = await axios.post(url,_data,{
      headers: {
        'Content-Type': 'application/json'
      }
    });
    response = { status : _response?.status , ..._response?.data };
  }
  catch(error:any){
    throw error;
  }
  return response;
}


export const getPostsAPI = async (_data:any) : Promise<unknown>=>{
  let response: ApiResponse = {};
  let url : string | undefined = `${commonAPIPath}/post/get-posts`;
  try{
    let _response = await axios.post(url,_data,{
      headers: {
        'Content-Type': 'application/json'
      }
    });
    response = { status : _response?.status , ..._response?.data };
  }
  catch(error:any){
    throw error;
  }
  return response;
}

export const reactOnPostAPI = async (_data:any) : Promise<unknown>=>{
  let response: ApiResponse = {};
  let url : string | undefined = `${commonAPIPath}/post/react-on-post`;
  try{
    let _response = await axios.post(url,_data,{
      headers: {
        'Content-Type': 'application/json'
      }
    });
    response = { status : _response?.status , ..._response?.data };
  }
  catch(error:any){
    throw error;
  }
  return response;
}

export const commentOnPostAPI = async(_data:any) : Promise<unknown> => {
  let response: ApiResponse = {};
  let url : string | undefined = `${commonAPIPath}/post/comment-on-post`;
  try{    
    let _response = await axios.post(url,_data,{
      headers:{
        "Content-Type":'application/json'
      }
    });
    response = { status : _response?.status , ..._response?.data };
  }catch(error:any){
    throw error;
  }
  return response;
}

export const getCommentsOnPostAPI = async(_data:any) : Promise<unknown> => {
  let response: ApiResponse = {};
  let url : string | undefined = `${commonAPIPath}/post/get-comments-on-post`;
  try{    
    let _response = await axios.post(url,_data,{
      headers:{
        "Content-Type":'application/json'
      }
    });
    response = { status : _response?.status , ..._response?.data };
  }catch(error:any){
    throw error;
  }
  return response;
}


export const getPostLikesDetailsAPi = async(_data:any) : Promise<unknown> => {
  let response: ApiResponse = {};
  let url : string | undefined = `${commonAPIPath}/post/get-post-likes-details`;
  try{    
    let _response = await axios.post(url,_data,{
      headers:{
        "Content-Type":'application/json'
      }
    });
    response = { status : _response?.status , ..._response?.data };
  }catch(error:any){
    throw error;
  }
  return response;
}

export const getPostCommentsDetailsAPi = async(_data:any) : Promise<unknown> => {
  let response: ApiResponse = {};
  let url : string | undefined = `${commonAPIPath}/post/get-post-comments-details`;
  try{    
    let _response = await axios.post(url,_data,{
      headers:{
        "Content-Type":'application/json'
      }
    });
    response = { status : _response?.status , ..._response?.data };
  }catch(error:any){
    throw error;
  }
  return response;
}

export const getUsersPostTaggedWithAPI =  async(_data:any) : Promise<unknown> => {
  let response : ApiResponse = {};
  let _url : string | undefined = `${commonAPIPath}/post/get-users-post-tagged-with`;
  try{
    let _response =  await axios.post(_url,_data,{
      headers : {
        'Content-Type' : 'application/json'
      }
    });
    response = { status : _response?.status , ..._response?.data };
  }
  catch(error:any){
    throw error;
  }
  return response;
}

export const getCommentsReplyAPI =  async(_data:any) : Promise<unknown> => {
  let response : ApiResponse = {};
  let _url : string | undefined = `${commonAPIPath}/post/get-comments-reply`;
  try{
    let _response =  await axios.post(_url,_data,{
      headers : {
        'Content-Type' : 'application/json'
      }
    });
    response = { status : _response?.status , ..._response?.data };
  }
  catch(error:any){
    throw error;
  }
  return response;
}

export const getUsersPostSharedWithAPI =  async(_data:any) : Promise<unknown> => {
  let response : ApiResponse = {};
  let _url : string | undefined = `${commonAPIPath}/post/get-users-post-shared-with`;
  try{
    let _response =  await axios.post(_url,_data,{
      headers : {
        'Content-Type' : 'application/json'
      }
    });
    response = { status : _response?.status , ..._response?.data };
  }
  catch(error:any){
    throw error;
  }
  return response;
}

export const reactOnCommentAPI = async (_data:any) : Promise<unknown>=>{
  let response: ApiResponse = {};
  let url : string | undefined = `${commonAPIPath}/post/react-on-comment`;
  try{
    let _response = await axios.post(url,_data,{
      headers: {
        'Content-Type': 'application/json'
      }
    });
    response = { status : _response?.status , ..._response?.data };
  }
  catch(error:any){
    throw error;
  }
  return response;
}