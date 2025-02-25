
'use server'

export const getTestimonialData = async (user_id :number,yearbook_id :number , institution_id :number): Promise<any> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/testimonial?user_id=${user_id}&yearbook_id=${yearbook_id}&institution_id=${institution_id}`, { method: 'GET' });
        
      if (!response.ok) {
        throw new Error('Failed to fetch Received Testimonial Data');
      }

      return await response.json();       

    } catch (error) {
      console.error(error);
      throw error;
    }
};
  

export const saveTestimonial = async (formData:any) => {

  const cdt = new Date()

  const opt = { method : 'POST', headers : {'Accept': 'application/json', 'Content-Type': 'application/json',},
                body   : JSON.stringify({data_id : cdt.toISOString(), ...formData})}

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/testimonial/write`, opt)
  
  if (!res) {
    const error:any = [];

    return error.json()
  }

  return res.json()
};

