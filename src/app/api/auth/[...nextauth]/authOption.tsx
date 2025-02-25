import { NextAuthOptions } from "next-auth";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
//import isEqual from "lodash/isEqual";
import { format } from 'date-fns'

import excuteQuery from '@/app/api/connect_m'
//import { Session } from "inspector";

const getExistingUser = async (email_id:any) => {

  var user_rec = null

  try {
          
    const qry:any = `SELECT 
                      id, CONCAT_WS(' ', first_name, last_name) AS user_name, google_user_id, profile_photo, 
                      verification_code
                    FROM 
                      users
                    WHERE
                      email = ?`

    const val:any = [email_id]

    const res:any = await excuteQuery(qry, val)
    
    if(res.q_res && res.q_res[0]) {
      const usr = res.q_res[0]

      if(usr && typeof usr !== "undefined") {
        user_rec = {
          id: usr.id,
          name: usr.user_name,
          image: usr.profile_photo,
          google_user_id :usr.google_user_id,
          verification_code: usr.verification_code 
        }
      }
    }
    
    return user_rec as any;
  } catch (e) {
    //throw new Error(e.message);
    
    return null;
  }
}

const createNewUser = async (u_info:any) => {
  
  var user_id = 0;

  try {

    if (u_info??0) {

      const str_dt = format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      
      const qry = `INSERT INTO
                    users
                  SET 
                    first_name = ?, last_name = '', username = ?, gender = 'M', email = ?, password = '',
                    tmp_password = '', phone_number = '', whatsup_number = '', city_id = 0, address = '', zip_code = '', 
                    google_user_id = ?, verification_code = 'google-auth', is_verified = '1', status = '1', user_type = 'S', 
                    role_id = '3', created = ?, modified = ?`
      
      const val = [u_info?.name, u_info?.email, u_info?.email, u_info?.sub, str_dt, str_dt]
      const res = await excuteQuery(qry, val);

      if(res.q_err) {
        
      }
      else {

        user_id = res?.q_res?.insertId??0
      }
    }
  }
  catch(err:any) {

  }

  return user_id;
}

const updateUser = async (user_id:any, user_info:any) => {
  
  var res_status = 0;

  try {

    if (user_id??0) {

      const str_dt = format(new Date(), 'yyyy-MM-dd HH:mm:ss')

      const qry = `UPDATE
                    users
                  SET 
                    google_user_id = ?, verification_code = ?, is_verified = '1', status = '1', modified = ?
                  WHERE 
                    id = ?`;
      
      const val = [user_info?.google_user_id, user_info.v_code, str_dt, user_id];
            
      const res = await excuteQuery(qry, val);

      if(res.q_err) {
        
      }
      else {

        res_status = 1
      }
    }
  }
  catch(err:any) {

  }

  return res_status;
}

type ISODateString = string
interface DefaultSession1 {
  user?: {
    id ?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
  expires: ISODateString;
}
export const authoption: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {},
      async authorize(credentials: any) {
        
        const { email, password } = credentials;
        
        var user = null;

        try {
          
          const qry:any = `SELECT 
                            id, CONCAT_WS(' ', first_name, last_name) AS user_name, email, password AS pwd, 
                            SHA(?) AS pwd1, role_id, profile_photo
                          FROM 
                            users
                          WHERE
                            (username = ? OR email = ?) AND status = '1' AND is_verified = '1'`

          const val:any = [password, email, email]

          const result = await excuteQuery(qry, val)
          
          if(result.q_res && result.q_res[0]) {
            const usr = result.q_res[0]
      
            if(usr && typeof usr !== "undefined" && typeof usr.pwd !== "undefined" && usr.pwd === usr.pwd1) {
              user = {
                id: usr.id,
                name: usr.user_name,
                password: '',
                email: usr.email,
                image: usr.profile_photo,
                role_id: usr.role_id 
              }
            }
          }
          
          return user as any;
        } catch (e) {
          //throw new Error(e.message);
          
          return null;
        }
      },
    }),
    Github({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      
      if (user?.email) {
        token.email = user.email;
      }
      
      if(account?.provider === 'google') {
        
        if(token && token?.sub && token?.email && token?.name) {

          const usr_info = await getExistingUser(token?.email);

          if(usr_info && usr_info?.id) {
            
            if(usr_info?.google_user_id?.trim() != token?.sub) {

              const v_code   = (usr_info?.verification_code?.trim() != '') ? usr_info?.verification_code?.trim() : 'google-auth'; 
              const usr_data = {google_user_id : token?.sub,  v_code : v_code} 

              const u_res = await updateUser(usr_info?.id, usr_data);

              if(u_res === 0) {
                token.sub     = '';
                token.email   = null;
                token.name    = null;
                token.picture = null;
              }
              else {
                token.sub = usr_info?.id??''
              }
            }
            else {
              token.sub = usr_info?.id??''  
            }
          }
          else {
            
            const uid = await createNewUser(token);
            
            if(uid === 0) {

              token.sub     = '';
              token.email   = null;
              token.name    = null;
              token.picture = null;
            }
            else {

              token.sub = uid+''  
            }
          }
        }
      }

      return token;
    },        
    async redirect({ url, baseUrl }) {
      
      // Allow relative URLs (like "/newsfeed/style1")
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allow external URLs (ensure they match the base URL)
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default to baseUrl if any issue
      return baseUrl;
    },
    // async redirect({ url, baseUrl }) {
    //   return url.startsWith(baseUrl) ? url : baseUrl;
    // }
  },
  debug:true
  
};
