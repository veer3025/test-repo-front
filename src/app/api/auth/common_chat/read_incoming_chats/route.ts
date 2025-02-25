// MTak Begin
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import { format } from 'date-fns'
import excuteQuery from '@/app/api/connect_m'
type Data = {

};
export async function POST(request:Request) {
  let apiStatus : boolean = true;
  let successMessage : string = "Message Read";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    let formData =  await request.formData();
    let chadIds : any[] = formData.getAll('chatIds');
    let seen_by_to_user = getCurrentTimeStamp();
    //console.log(seen_by_to_user);
    //console.log(chadIds.toString());
    let query = `
      UPDATE user_chats 
        SET seen_by_to_user = '${seen_by_to_user}'
      WHERE id IN(${chadIds.toString()})
      AND removed = 'N'
      AND seen_by_to_user IS NULL
    `;
    let q_param : any = [];
    let qry_response = await excuteQuery(query,q_param);;
    if(qry_response.q_res)
    {
      //do nothing
    }
    else{
      throw new Error("Update Query Error");
    }
    //Upload files Begin
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

const getCurrentTimeStamp = () : string => {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
}