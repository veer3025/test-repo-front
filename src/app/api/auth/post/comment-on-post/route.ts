// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import {getCurrentTimeStamp} from "@/libs/common_function"
import excuteQuery from '@/app/api/connect_m'
import { sendNotification ,notificationTypeType} from "@/app/api/auth/notification/sendNotification";
type Data = {

};
type ReqData = {
  postId:number;
  comment:string;
}
export async function POST(request:Request) {
  let apiStatus : boolean = true;
  let successMessage : string = "Commented On Post";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    let req_data : ReqData = await request.json();
    const {postId,comment} = req_data;
    const current_time_stamp : string = getCurrentTimeStamp();
    const removed : "Y"|"N" = "N";
    
    let q_param : any[] = [postId,login_user_id,comment,removed,current_time_stamp,current_time_stamp];
    let qry : string = `
      INSERT INTO post_comment_trans(post_id,user_id,comment,removed,created,modified)
      VALUES(
        ${ "?,".repeat(q_param.length).replace(/,*\s*$/,"") }
      )
    `;
    let q_response = await excuteQuery(qry,q_param);
    //console.log(q_response);
    let q_res = q_response.q_res;
    if(q_res)
    {
      let response_send_notification : any = await sendNotification(login_user_id,'C' as notificationTypeType,{ postId : postId} );
    }
    else
    {
      throw new Error("post_comment_trans query error");
    }
  }
  catch(error)
  {
    // console.log(error);
    apiStatus = false;
  }
  if(apiStatus)
  {
    return NextResponse.json(
      {
        'message': successMessage,
        'data' : data,
        'error' : ''
      },
      {
        'status':200,
        'statusText':"Response Ok"
      }
    );
  }
  else{
    return NextResponse.json(
      {
        'message': errorMessage,
        'data' : {},
        'error' : ''
      },
      {
        'status':401,
        'statusText':"Error Occur"
      }
    );
  }
}
