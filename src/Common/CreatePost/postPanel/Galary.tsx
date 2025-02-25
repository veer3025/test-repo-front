//Mtak begin

'use client'
import { FC ,useState } from "react";
import { Fragment } from "react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

const Galary : FC<{ basePath : string , images : any[] , post_id : any}> = ({basePath,images,post_id}) => {
  const [index, setIndex] = useState(-1);
  const currentImage = `${basePath}/${images[index]?.system_name ?? ""}`;
  const nextIndex = (index + 1) % images.length;
  const nextImage = `${basePath}/${images[nextIndex]?.system_name ?? ""}` || currentImage;
  const prevIndex = (index + images.length - 1) % images.length;
  const prevImage = `${basePath}/${images[prevIndex]?.system_name ?? ""}` || currentImage;

  //event handler begin
  const handleClick = (index: number) => {
    setIndex(index);
  }
  const handleClose = () => setIndex(-1);
  const handleMovePrev = () => setIndex(prevIndex);
  const handleMoveNext = () => setIndex(nextIndex);
  //event handler end

  //local var
  const imagesToShow : any[] = images.filter((record:any,index:number)=>{ return index < 5 });
  let GalaryDivClss : string = imagesToShow?.length == 1 ? 'singleImageDiv' :  'galaryDiv';
  //local var
  return(
    <>
      <div className = {`${GalaryDivClss} count_${imagesToShow.length}`}>
        {
          imagesToShow.map((record : any,index : number)=>{
            return(
              <Fragment key = {index} >
                {
                  Boolean(record?.system_name) &&
                  <div className={`imgDiv`} onClick = { () => {handleClick(index)} }>
                    <img src = {`${basePath}/${record?.system_name ?? ""}`} key={index} />
                    {
                      (index == 4) &&
                      <div className="view_more">
                        <button className="no_style_button view_more">
                          View All
                        </button>
                      </div>
                    }
                  </div>
                }
              </Fragment>
            );
          })
        }
      </div>
      {
        Boolean(currentImage) && (index >= 0) && (
          <Lightbox
            mainSrc={currentImage}
            imageTitle={""}
            mainSrcThumbnail={currentImage}
            nextSrc={nextImage}
            nextSrcThumbnail={nextImage}
            prevSrc={prevImage}
            prevSrcThumbnail={prevImage}
            onCloseRequest={handleClose}
            onMovePrevRequest={handleMovePrev}
            onMoveNextRequest={handleMoveNext}
          />
        )
      }
    </>
  );
}

export default Galary;