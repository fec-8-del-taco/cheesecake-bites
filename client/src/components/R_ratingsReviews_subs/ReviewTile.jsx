import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ImgView from '../E_qa_subs/ImgView.jsx';
import StarComponent from '../StarComponent.jsx';

const ReviewTile = function ReviewTile({ review, setRList, productID }) {
  const [photosArr, setPhotosArr] = React.useState([]);
  const [imgViewStyle, setImgViewStyle] = React.useState({display: 'none'});
  const [imgUrl, setImgUrl] = React.useState('');
  let date = new Date(review.date)

  const handleVote = (e) => {
    e.preventDefault()
    if(window.localStorage.getItem(`voted${review.review_id}`) === null) {
      window.localStorage.setItem(`voted${review.review_id}`, true);
      const url = `https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/reviews/${review.review_id}/helpful`;
      const auth = {'Authorization': process.env.GITHUB_TOKEN}
      axios({method: 'put', url, headers: auth})
        .then(res => {
          console.log('response', res);
          setRList(review.review_id);
        })
        .catch(err => {
          console.log('error', err);
        })
    }
  };

  const handleReport = (e) => {
    e.preventDefault()
    if(window.localStorage.getItem(`reported${review.review_id}`) === null) {
      window.localStorage.setItem(`reported${review.review_id}`, true);
      const url = `https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/reviews/${review.review_id}/report`;
      const auth = {'Authorization': process.env.GITHUB_TOKEN}
      axios({method: 'put', url, headers: auth})
        .then(res => {
          console.log('response', res);
          setRList();
        })
        .catch(err => {
          console.log('error', err);
        })
    }
  }

  const openImg = (url) => {
    setImgUrl(url);
    setImgViewStyle({display: 'block'});
  };

  React.useEffect(() => {
    if(review.photos.length) {
      var photoInput = [];

      review.photos.forEach((photo, i) => {
        // console.log('photo', photo, typeof photo);
        var photoUrl = typeof photo === 'object' ? photo.url : photo;
        var photoID = typeof photo === 'object' ? photo.id : Number((review.review_id + '')+i);

        photoInput.push(
          <img onClick={e => {e.preventDefault(); openImg(photoUrl)}} className='a-thumbnails' key={photoID} src={photoUrl} onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.style.display = 'none';
            currentTarget.src="https://climate.onep.go.th/wp-content/uploads/2020/01/default-image.jpg";
          }}></img>
        )
//"this.onerror=null; this.src='https://placeimg.com/200/300/animals';"
      });
      setPhotosArr(photoInput);
    }
  },[review]);

  return (
    <div className="review-tile">
      <div className="review-tile-head">
        <span>
          <StarComponent productID={productID} avg={review.rating}/>
        </span>
        <span>{date.toLocaleDateString()}</span>
      </div>
      <div className="review-tile-content">
        <div className="review-tile-user">
          <span><span id="by">by</span> {review.reviewer_name}</span>
          {review.recommend === true &&
            <div>
              ✔ I recommended this product
            </div>
          }
        </div>
        <div className="review-tile-body">
          <span
          style={{"height": "30%"}}>
            {review.summary}
          </span>
          <div>
            <div className="review-tile-body-body">{review.body}</div>
            <div className='photo-div'>{photosArr}</div> {/* photo THUMBNAILS HERE */}
          </div>
        </div>
        {review.response &&
          <div style={{backgroundColor: "gray"}}>
            <h3>Response</h3>
            {review.response}
          </div>
        }
      </div>
      <span className="review-tile-help">Helpful? <a onClick={handleVote}>Yes</a> ({review.helpfulness}) | <a onClick={handleReport}>Report</a></span>
      <div>
        <ImgView style={imgViewStyle} setStyle={setImgViewStyle} url={imgUrl}/>
      </div>
    </div>
  )
}

export default ReviewTile;
