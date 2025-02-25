// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import {getCurrentTimeStamp} from "@/libs/common_function"
type Data = {
  chats?:any[];
  login_user?:any
};

type ReqData = {
  chat_with_user_id : number,
}
export async function POST(request:Request) {
  let apiStatus : boolean = true;
  let successMessage : string = "Record Found";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  let current_time_stamp : string = getCurrentTimeStamp();
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    const req_data : ReqData = await request.json();
    const {chat_with_user_id} = req_data;
    const qry :string = `
      SELECT 
        temp.*,
        (
          CASE 
            WHEN snd_dte_secnds_diff < 60 THEN 
              CONCAT(ROUND(snd_dte_secnds_diff)," second ago")
            WHEN snd_dte_secnds_diff < 60 * 60 THEN
              CONCAT(ROUND(snd_dte_secnds_diff / 60)," minute ago")
            WHEN snd_dte_secnds_diff < 60 * 60 * 24 THEN
              CONCAT(ROUND(snd_dte_secnds_diff / (60 * 60)) ," hour ago")
            ELSE send_date
          END
        ) AS send_text
      FROM
        (
          SELECT 
            uc.id,
            uc.from_user_id,
            uc.to_user_id,
            uc.message,
            uc.chat_type,
            uc.file_type,
            uc.file_system_name,
            uc.file_original_name,
            uc.seen_by_to_user,
            DATE_FORMAT(uc.created,"%d %b %y %h:%i %p") as send_date,
            ABS(TIMESTAMPDIFF(SECOND,uc.created,'${current_time_stamp}')) AS snd_dte_secnds_diff,
            IF(uc.seen_by_to_user IS NULL,'N','Y') as is_seen 
            FROM user_chats uc
            WHERE 
              uc.removed = 'N' 
              AND(
                (uc.from_user_id = ? AND uc.to_user_id = ?) 
                OR (uc.to_user_id = ? AND uc.from_user_id = ?)
              ) 
        ) temp
    `;
    
 
    const q_param : any = [login_user_id,chat_with_user_id,login_user_id,chat_with_user_id];
    const q_result : any = await excuteQuery(qry,q_param);
    // console.log(q_result);
    if(q_result?.q_res)
    {
      data.chats = q_result?.q_res ?? [];
    }
    else{
      throw new Error("QRY Error");
    }

    //get login_user_detail
    data.login_user = await getUserById(login_user_id);
  }
  catch(error)
  {
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

const getUserById = async (id:number) : Promise<any> => {
  let response : any = null;
  try{
    let qry : string = `
      SELECT 
        id,
        CONCAT_WS('',users.first_name,users.last_name) as full_name,
        users.profile_photo
      FROM
        users 
      WHERE 
        id = ${id} LIMIT 1
    `;
    const q_param : any = [];
    const q_result : any = await excuteQuery(qry,q_param);
    if(q_result?.q_res)
    {
      response = q_result?.q_res[0] ?? [];
    }
    else{
      throw new Error("QRY Error");
    }
  }
  catch(error)
  {
   
  }
  return response;
} 