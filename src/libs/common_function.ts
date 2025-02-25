import { format } from 'date-fns'
export const getCurrentTimeStamp = () : string => {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
}