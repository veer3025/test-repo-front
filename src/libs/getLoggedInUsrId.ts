// MTak Begin
import { getToken } from 'next-auth/jwt';
import { NextApiRequest } from 'next';
export const getLoggedInUserId = async(req:any) : Promise<number> => {

  let login_user_id : string = '0';

  try {
    const token : any = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    login_user_id = token?.sub ?? '0'
  }
  catch(error) {

  }
  return parseInt(login_user_id);
}