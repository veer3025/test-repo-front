export const getCoordinators = async () => {

    const cdt = new Date()
    const opt = { method : 'POST', headers : {'Accept': 'application/json', 'Content-Type': 'application/json',},
                  body   : JSON.stringify({data_id : cdt.toISOString()})}
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/coordinators`, opt)
    
    if (!res) {
      const error:any = [];
  
      return error.json()
    }
    
    return res.json()
};  
  
  