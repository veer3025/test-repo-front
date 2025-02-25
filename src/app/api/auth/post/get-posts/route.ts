// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import {getCurrentTimeStamp} from "@/libs/common_function"
type Data = {
  posts?:any[];
};

type ReqData = {
  l_post_id?: number;
}

export const POST = async (request : Request) =>{ 
  let apiStatus : boolean = true;
  let successMessage : string = "Record Found";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  const limit : number = 10;
  let current_time_stamp : any = getCurrentTimeStamp();
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    let req_data =  await request.json();
    const {l_post_id = 0 } : ReqData = req_data;

    const qry : string = `
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
      FROM(
        SELECT
          post_1.id,
          post_1.user_id,
          CONCAT_WS(" ",u1.first_name,u1.last_name) AS post_by_user_name,
          u1.email AS post_by_email,
          u1.profile_photo AS post_by_user_pfp,
          post_1.gr_class,
          post_1.message,
          DATE_FORMAT(post_1.created,"%e %b %y %l:%i %p") AS created_date,
          countries.name AS country_name,
          ABS(TIMESTAMPDIFF(SECOND,post_1.created,'${current_time_stamp}')) AS created_dte_secnds_diff,
          post_1.type,
          (
            SELECT 
              JSON_ARRAYAGG(
                CASE
                  WHEN pit.image_system_name IS NOT NULL AND pit.image_origional_name IS NOT NULL THEN
                    JSON_OBJECT(
                      'system_name', pit.image_system_name,
                      'original_name', pit.image_origional_name
                    )
                  ELSE NULL
                END
              ) AS images
            FROM 
              post_image_trans pit 
            WHERE 
              pit.post_id = post_1.id 
              AND pit.removed = 'N' LIMIT 1
          ) images,
          IF( post_1.user_id  = ${login_user_id}  , 'Y' , 'N') canEdit,
          ( SELECT
              plt_2.reaction_code
            FROM
              post_like_trans plt_2
            WHERE
              plt_2.user_id = ${login_user_id} 
                AND plt_2.removed = "N"
                AND post_1.id = plt_2.post_id LIMIT 1
          ) AS reaction_by_logged_usr
        FROM
          posts post_1
        INNER JOIN users u1
          ON u1.id =  post_1.user_id
            AND u1.status = 1
            AND u1.is_verified = 1
        LEFT JOIN
          countries ON countries.id = u1.country_id
        WHERE
        (
          post_1.user_id = ${login_user_id} 
          OR
          CASE
            WHEN post_1.type = 'PRIVATE' THEN
              post_1.id IN(
                SELECT
                pst_2.post_id
                FROM
                post_share_trans pst_2
                WHERE
                pst_2.user_id = ${login_user_id}  AND pst_2.removed = 'N'
              )
            WHEN post_1.type = 'PUBLIC' THEN
              post_1.user_id IN(
                SELECT
                  yut_2.user_id
                FROM
                  yearbook_user_trans yut_2
                WHERE yut_2.yearbook_id IN(
                  SELECT
                    yut_1.yearbook_id
                  FROM
                    yearbook_user_trans yut_1
                  WHERE
                    yut_1.user_id = ${login_user_id} 
                    AND yut_1.removed = 'N'
                )
              )
            ELSE
              FALSE
          END
        )
        ${ l_post_id ? `AND post_1.id < ${l_post_id}` : ''}
        AND post_1.removed = 'N'
        GROUP BY post_1.id
      ) temp
      ORDER BY
      temp.id DESC
      LIMIT ${limit}
    `;

    const q_param : any = [login_user_id];
    const q_result : any = await excuteQuery(qry,q_param);
    //console.log(qry);
    if(q_result?.q_res)
    {
      data.posts = q_result?.q_res ?? [];
    }
    else{
      throw new Error("QRY Error");
    }
  }
  catch(error)
  {
    //console.log(error);
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
