// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import excuteQuery from '@/app/api/connect_m'
import { format } from 'date-fns'
type Data = {
  users?:any[];
};

type ReqData = {
  'postType'?:string;
  'userIds'?: number[];
}

export async function POST(request:Request) {
  let apiStatus : boolean = true;
  let successMessage : string = "Record Found";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    let req_data =  await request.json();
    const { postType = "" ,userIds = [] } : ReqData = req_data;

    // console.log(postType);
    // console.log(userIds);

    const qry :string = `
      SELECT 
        yut_2.id,
        yut_2.user_id,
        yut_2.yearbook_id,
        yb_1.name AS yearbook_name,
        CONCAT_WS(' ',users.first_name,users.last_name) AS full_name,
        users.profile_photo,
        users.email,
        CONCAT_WS(' ',users.first_name,users.last_name) as value
      FROM 
        yearbook_user_trans yut_2
      INNER JOIN users 
        ON yut_2.user_id =  users.id
        AND users.status = 1
        AND users.is_verified = 1
      LEFT JOIN yearbooks yb_1
	      ON yb_1.id = yut_2.yearbook_id
      WHERE
        yut_2.removed = 'N'
        AND yut_2.user_id <> ${login_user_id}
        AND yut_2.yearbook_id IN (
          SELECT yut_1.yearbook_id FROM yearbook_user_trans yut_1 WHERE yut_1.user_id = ${login_user_id} AND yut_1.removed = 'N'
        )
        ${ postType == 'PRIVATE' ? `AND yut_2.user_id IN(${userIds.toString()})` : ``}
      GROUP BY 
        yut_2.user_id
      ORDER BY 
        full_name ASC
    `;
    const q_param : any = [];
    const q_result : any = await excuteQuery(qry,q_param);
    if(q_result?.q_res)
    {
      data.users = q_result?.q_res ?? [];
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
