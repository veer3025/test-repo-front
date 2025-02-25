// MTak Begin
import axios from 'axios';
export type ApiResponse = {status:number,  data?: any, message: string, error?: string };
export const commonAPIPath : string = `${process.env.NEXT_PUBLIC_API_URL as string}/auth`;

export const getChatUsersAPI = async(_body : string) : Promise<unknown> =>{
  let response : unknown = null;
  let url : string | undefined = `${commonAPIPath}/common_chat/get_chat_users`;
  try{
    let response_promise = await fetch(url,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: _body
    });

    let result = await response_promise.json();
    response = { status : response_promise.status , ...result};
  }
  catch(error:any){
    error?.message
   // throw error;
  } 
  finally{

  }
  return response;
}

export const getChatsByUserIdAPI = async(_body : string) : Promise<unknown> =>{
  let response : unknown = null;
  let url : string | undefined = `${commonAPIPath}/common_chat/get_chats_by_user_id`;
  try{
    let response_promise = await fetch(url,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: _body
    });

    let result = await response_promise.json();
    response = { status : response_promise.status , ...result};
  }
  catch(error:any){
   throw error;
  } 
  finally{

  }
  return response;
}

export const sendChatMessageAPI = async(_formData : any) : Promise<unknown> =>{
  let response : unknown = null;
  let url : string | undefined = `${commonAPIPath}/common_chat/send_chat_message`;
  try{
    // let response_promise = await fetch(url,{
    //   method: 'POST',
    //   body: _formData
    // });

    // let result = await response_promise.json();
    // response = { status : response_promise.status , ...result};
    let response_temp = await axios.post(url, _formData, {
      onUploadProgress: (event: any) => {
        if (event.total) {
          const progressPercentage = Math.round((event.loaded * 100) / event.total);
        }
      },
    });
    response = { status : response_temp.status , ...response_temp?.data};
  }
  catch(error:any){
    // sconsole.log(error);
    throw error;
  } 
  finally{

  }
  return response;
}


export const getIncomingChatsAPI = async(_body : string) : Promise<unknown> =>{
  let response : unknown = null;
  let url : string | undefined = `${commonAPIPath}/common_chat/get_Incoming_chats`;
  try{
    let response_promise = await fetch(url,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: _body
    });

    let result = await response_promise.json();
    response = { status : response_promise.status , ...result};
  }
  catch(error:any){
   throw error;
  } 
  finally{

  }
  return response;
}

export const downloadChatFileAPI = async(_body : string) : Promise<unknown> =>{
  let response : unknown = null;
  let url : string | undefined = `${commonAPIPath}/common_chat/download_file`;
  try{
    let response_promise = await fetch(url,{
      method: 'POST',
      body: _body
    });

    console.log(response_promise);
    if(response_promise.status == 200)
    {
      const file_name : string | null= response_promise.headers.get('file_original_name');
      const blob = await response_promise.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = file_name ?? "";
      link.click();
      URL.revokeObjectURL(link.href);
    }
    else{
      throw Error("Error Occur");
    }
  }
  catch(error:any){
   throw error;
  } 
  finally{

  }
  return response;
}

export const readIncomingChatsAPI = async(_formData : any) : Promise<unknown> =>{
  let response : unknown = null;
  let url : string | undefined = `${commonAPIPath}/common_chat/read_incoming_chats`;
  try{
    let response_promise = await fetch(url,{
      method: 'POST',
      body: _formData
    });

    let result = await response_promise.json();
    response = { status : response_promise.status , ...result};
  }
  catch(error:any){
   throw error;
  } 
  finally{

  }
  return response;
}

export const getChatNotificationAPI = async(_data : any) : Promise<unknown | never>  =>{
  let response : unknown = null;
  let url : string | undefined = `${commonAPIPath}/common_chat/chat_notification`;
  try{
    let _response = await axios.post(url,_data,{
      headers: {
        'Content-Type': 'application/json'
      }
    });
    response = { status : _response.status , ..._response?.data};
  }
  catch(error:any){
    throw error;
  } 
  finally{

  }
  return response;
}


export const getChatUsersActivity = async(_data : any): Promise<unknown | never> =>{
  let response : unknown = null;
  let url : string | undefined = `${commonAPIPath}/common_chat/get_chat_users_activity`;
  try{
    let _response = await axios.post(url,_data,{
      headers : {
        'Content-Type':'application/json',
      }
    });
    response = {'status': _response.status , ..._response.data};
  }
  catch(error:any){
    throw error;
  }
  finally{

  }
  return response;
}