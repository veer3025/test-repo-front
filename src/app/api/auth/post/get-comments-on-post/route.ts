// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import {getCurrentTimeStamp} from "@/libs/common_function"
type Data = {
  comments?:any[];
};

type ReqData = {
  postId?:number;
  l_comment_id?: number;
}

export const POST = async (request : Request) =>{ 
  let apiStatus : boolean = true;
  let successMessage : string = "Record Found";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  const current_time_stamp : any = getCurrentTimeStamp();
  const limit : number = 5;
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    let req_data =  await request.json();
    const {l_comment_id = 0 ,postId} : ReqData = req_data;
    //console.log(l_comment_id);
    const qry :string = `
      SELECT 
        temp.*,
        (
          CASE 
            WHEN created_dte_secnds_diff < 60 THEN 
              CONCAT(ROUND(created_dte_secnds_diff)," second ago")
            WHEN created_dte_secnds_diff < 60 * 60 THEN
              CONCAT(ROUND(created_dte_secnds_diff / 60)," minute ago")
            WHEN created_dte_secnds_diff < 60 * 60 * 24 THEN
              CONCAT(ROUND(created_dte_secnds_diff / (60 * 60)) ," hour ago")
            ELSE 
              created_date
          END
        ) AS created_text
      FROM
      (
        SELECT 
          pct.id,
          pct.comment,
          pct.post_id,
          pct.user_id AS cmnt_by_usr_id,
          CONCAT_WS(" ",u1.first_name,u1.last_name) AS cmnt_by_usr_name,
          u1.profile_photo AS cmnt_by_pfp,
          u1.email,
          DATE_FORMAT(pct.created,"%e %b %y %l:%i %p") AS created_date,
          ABS(TIMESTAMPDIFF(SECOND,pct.created,'${current_time_stamp}')) AS created_dte_secnds_diff,
          countries.name as country_name,
          ( 
            SELECT 
              pclt.reaction_code 
            FROM 
              post_comment_like_trans pclt 
            WHERE 
              pclt.removed = "N" 
              AND pclt.post_comment_tran_id = pct.id
              AND pclt.user_id = ${login_user_id} LIMIT 1
          ) AS reaction_by_logged_usr
        FROM post_comment_trans pct 
        LEFT JOIN 
          users u1
          ON u1.id = pct.user_id
          AND u1.status = 1
          AND u1.is_verified = 1
        LEFT JOIN 
          countries ON countries.id = u1.country_id
        WHERE pct.removed = 'N'
          AND pct.post_id = ${postId}
          ${ l_comment_id ? `AND pct.id < ${l_comment_id}` : ''}
      ) temp
      ORDER BY temp.id DESC
      LIMIT ${limit}
    `;

    const q_param : any = [login_user_id];
    const q_result : any = await excuteQuery(qry,q_param);
    // console.log(qry);
    if(q_result?.q_res)
    {
      data.comments = q_result?.q_res ?? [];
    }
    else{
      throw new Error("QRY Error");
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
