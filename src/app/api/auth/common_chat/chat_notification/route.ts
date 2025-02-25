// MTak Begin
// import mysql from 'mysql2/promise'
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import {getCurrentTimeStamp} from "@/libs/common_function"
type Data = {
  chats?:any[];
  count?:number;
};

type ReqData = {
  'chat':string,
  'count':string
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
    const {chat,count} = req_data;
    if(chat == "Y")
    {
      const qry_1 :string = `
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
              uc_1.id,
              uc_1.from_user_id,
              uc_1.to_user_id,
              uc_1.message,
              uc_1.chat_type,
              uc_1.file_type,
              uc_1.file_system_name,
              uc_1.file_original_name,
              uc_1.seen_by_to_user,
              DATE_FORMAT(uc_1.created,"%e %b %y %l:%i %p") as send_date,
              ABS(TIMESTAMPDIFF(SECOND,uc_1.created,'${current_time_stamp}')) AS snd_dte_secnds_diff,
              CONCAT_WS('',usr_from.first_name,usr_from.last_name) AS from_user_full_name,
              usr_from.profile_photo AS from_user_profile_photo,
              ( 
                SELECT 
                  JSON_OBJECT( 
                    'last_seen',
                    DATE_FORMAT(ulh_1.logout_time,"%e %b %y %l:%i %p"),
                    'days_since_last_login',
                    DATEDIFF('${current_time_stamp}',ulh_1.logout_time),
                    'seconds_since_last_login',
                    TIMESTAMPDIFF(SECOND,ulh_1.logout_time,'${current_time_stamp}')
                  ) 
                FROM user_login_histories ulh_1 WHERE ulh_1.user_id = uc_1.from_user_id
                ORDER BY ulh_1.id DESC 
                LIMIT 1
              ) AS last_seen_object
            FROM 
              user_chats uc_1
            INNER JOIN users usr_from
              ON usr_from.id =  uc_1.from_user_id
            WHERE
              uc_1.removed = 'N'
              AND uc_1.seen_by_to_user IS NULL
              AND uc_1.to_user_id = ${login_user_id}
              AND uc_1.from_user_id IN
              (
                SELECT
                  DISTINCT yut_2.user_id
                FROM 
                  yearbook_user_trans yut_2
                WHERE 
                  yut_2.user_id <> uc_1.to_user_id
                  AND yut_2.removed = 'N'
                  AND yut_2.yearbook_id IN 
                  (
                    SELECT 
                      yut_1.yearbook_id
                    FROM
                      yearbook_user_trans yut_1
                    WHERE 
                      yut_1.user_id = uc_1.to_user_id AND yut_1.removed = 'N'
                  )
              )
          ) temp
          ORDER BY temp.id DESC
          limit 20
      `;      
      const q_param : any = [];
      const q_result : any = await excuteQuery(qry_1,q_param);
      if(q_result?.q_res)
      {
        data.chats = q_result?.q_res ?? [];
      }
      else{
        throw new Error("QRY Error");
      }
    }
    else{
      data.chats = [];
    }

    if(count == "Y")
    {
      const qry_2 : string = `
        SELECT
          COUNT(uc.id) AS chat_count
        FROM
          user_chats uc
        WHERE uc.removed = 'N'
          AND uc.seen_by_to_user IS NULL
          AND uc.from_user_id <> ${login_user_id}
          AND uc.to_user_id = ${login_user_id}
      `;
      const q_param_2 : any = [];
      const q_result_2 : any = await excuteQuery(qry_2,q_param_2);
      if(q_result_2.q_res)
      {
        let q_res_2 = q_result_2.q_res;
        data.count = q_res_2.length ? q_res_2[0].chat_count : 0;
      }
    }
    else{
      data.count = 0;
    }
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
