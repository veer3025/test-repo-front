export const getYearBookUserList = async (formData:any) => {

  const cdt = new Date()
  const opt = { method : 'POST', headers : {'Accept': 'application/json', 'Content-Type': 'application/json',},
                body   : JSON.stringify({data_id : cdt.toISOString(), ...formData})}

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/create-year-book/get-user-list`, opt)
  
  if (!res) {

    const error:any = [];

    return error.json()
  }

  return res.json()
};