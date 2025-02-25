// Mtak Begin
import { NextResponse } from "next/server";
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import {getCurrentTimeStamp} from "@/libs/common_function"
interface Data  {
  notification?:any[];
  count?:number;
};
interface ReqData {
  notification : string;
  count : string;
}

const notificationTypeArr : string[]= ['TR','TW','T','LP','C','LC','RR','LR','CN','P'];
const notificationQryIn : string = notificationTypeArr.map((type:string,index)=> `"${type}"`).join();

export async function POST(request:Request)
{   
  let data : Data = {};
  let apiStatus : boolean = true;
  let successMessage : string = "Record Found";
  let errorMessage : string = "Error Occur";
  let current_time_stamp : string = getCurrentTimeStamp();
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    const req_data : ReqData = await request.json();
    const {notification,count} = req_data;
    // console.log("notification " + notification);
    // console.log("count " + count);
    if(notification == "Y")
    {
      let qry = `
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
              notfi.id,
              notfi.from_user_id,
              notfi.to_user_id,
              notfi.title,
              notfi.message,
              notfi.status,
              notfi.created,
              CONCAT_WS(' ',u1.first_name,u1.last_name) AS from_user_name,
              u1.profile_photo as from_user_profile_photo,
              DATE_FORMAT(notfi.created,"%e %b %y %l:%i %p") AS send_date,
              IF(notfi.status = 'R' , DATE_FORMAT(notfi.modified,"%e %b %y %l:%i %p") , NULL) AS read_date,
              ABS(TIMESTAMPDIFF(SECOND,notfi.created,'${current_time_stamp}')) AS snd_dte_secnds_diff
            FROM 
              notifications notfi
            LEFT JOIN 
              users u1
                ON notfi.from_user_id = u1.id
            WHERE 
              notfi.to_user_id =  ${login_user_id}
              AND (notfi.status = 'P' OR notfi.status = 'N')
              AND notfi.removed = 'N'
              AND notfi.notification_type IN(${notificationQryIn})
          ) temp
          ORDER BY 
          temp.id DESC
          LIMIT 20
      `;
      //console.log(qry);
      const q_param : any = [];
      const q_result : any = await excuteQuery(qry,q_param);
      if(q_result.q_res)
      {
        data.notification = q_result.q_res;
      }
    }
    else{
      data.notification = [];
    }

    if(count == "Y")
    {
      const qry_2 : string = `
        SELECT 
          COUNT(notfi.id) as record_count
        FROM notifications notfi
        WHERE 
          notfi.to_user_id =  ${login_user_id}
          AND (notfi.status = 'P' OR notfi.status = 'N')
          AND notfi.removed = 'N'
          AND notfi.notification_type IN(${notificationQryIn})
      `;
      const q_param_2 : any = [];
      const q_result_2 : any = await excuteQuery(qry_2,q_param_2);
      //console.log(qry_2);
      if(q_result_2.q_res)
      {
        let q_res_2 = q_result_2.q_res;
        data.count = q_res_2.length ? q_res_2[0].record_count : 0;
      }
    }
    else{
      data.count = 0;
    }
  }
  catch(error:any){
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