// MTak Begin
// import mysql from 'mysql2/promise'
import {NextResponse} from 'next/server'
import { getLoggedInUserId } from "@/libs/getLoggedInUsrId"
import { readFile } from "fs/promises";
import fs from "fs"
import path from 'path';
// import excuteQuery from '@/app/api/connect_m'
const user_chats_base_path : string = 'public/images/user_chats';
type Data = {
  chats?:any[];
};

type ReqData = {
  file_system_name : string,
  file_original_name : string
}

export async function POST(request:Request,response : Response) {
  let apiStatus : boolean = true;
  let successMessage : string = "Record Found";
  let errorMessage : string = "Error Occur";
  let data : Data = {};
  try{
    let login_user_id : number =  await getLoggedInUserId(request);
    const req_data : ReqData = await request.json();
    const {file_system_name,file_original_name} = req_data;
    const filePath = path.resolve('.', user_chats_base_path, file_system_name);
    if (!fs.existsSync(filePath)) {
      throw new Error("File Not Found");
    }else{
      const buffer = await readFile(path.join(process.cwd(), `${user_chats_base_path}/${file_system_name}`));
      const headers = new Headers();
      headers.append("file_original_name",`${file_original_name}`);
      return new Response(buffer, {
        headers,
      });
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
