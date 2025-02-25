// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import {getCurrentTimeStamp} from "@/libs/common_function"
import excuteQuery from '@/app/api/connect_m'
import { sendNotification ,notificationTypeType} from "@/app/api/auth/notification/sendNotification";
type Data = {

};
type ReqData = {
  reaction_code:string;
  postId:number;
  remove_reaction:string;
}
export async function POST(request:Request) {
  let apiStatus : boolean = true;
  let successMessage : string = "Reacted On Post";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    let req_data : ReqData = await request.json();
    const {reaction_code , postId ,remove_reaction } = req_data;
    let current_time_stamp : string = getCurrentTimeStamp();
    let removed : "Y" | "N" = "N";
    let q_param_2 : any= [];

   // console.log(remove_reaction);
    //-------------------------BEGIN TRANSACTION start
    let result_start_transaction = await excuteQuery('START TRANSACTION',[]);
    //-------------------------BEGIN TRANSACTION end

    //Make new entry begin
    let query_1 : string = `
      UPDATE post_like_trans 
      SET removed = "Y"
      WHERE removed = "N" AND post_id = ? AND user_id = ?
    `;
    let q_param_1 : any= [postId,login_user_id];
    let qry_response_1 =  await excuteQuery(query_1,q_param_1); 
    let q_res1 = qry_response_1.q_res;
    if(!Boolean(q_res1))
    {
      throw new Error("qry error");
    }    
    //Make new entry end

    if(remove_reaction == "N")
    {
      //Make new entry begin
      let query_2 : string = `
        INSERT INTO post_like_trans(post_id,user_id,reaction_code,removed,created,modified)
        VALUES(${postId},${login_user_id},'${reaction_code}','${removed}','${current_time_stamp}','${current_time_stamp}')
      `;
      let qry_respons2 =  await excuteQuery(query_2,q_param_2); 
      let q_res2 = qry_respons2.q_res;
      if(q_res2)
      {
        let response_send_notification : any = await sendNotification(login_user_id,'LP' as notificationTypeType,{ postId : postId} );
      }    
      else
      {
        throw new Error("qry error");
      }
      //Make new entry end
    }

    //----------------------COMMIT transaction start
    let result_commit = await excuteQuery('COMMIT',[]);
    //----------------------COMMIT transaction end
  }
  catch(error)
  {
    //----------------------ROLLBACK TRANSACTION start
    let result_rollback = await excuteQuery('ROLLBACK',[]);
    //----------------------ROLLBACK TRANSACTION end
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
