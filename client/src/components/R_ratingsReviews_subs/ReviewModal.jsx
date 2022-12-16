import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import $ from 'jquery';
import styled from 'styled-components';

const ReviewModal = function ReviewModal({ isOpen, name, id, setIsOpen, charBreak, setRList }) {
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]);
  const [body, setBody] = useState('');
  const [starArray, setStarArray] = useState([1, 0, 0, 0, 0]);
  // const [starCount, setStarCount] = useState(1);
  const [currentSelection, setCurrentSelection] = useState({
    Size: 0,
    Width: 0,
    Comfort: 0,
    Quality: 0,
    Length: 0,
    Fit: 0
  })

  if (!charBreak.characteristics) {
    return null;
  }


  const chars = Object.keys(charBreak.characteristics);
  const charObj = charBreak.characteristics;
  const charChart = {
    Size: ['None selected', 'A size too small', '½ a size too small', 'Perfect', '½ a size too big', 'A size too wide'],
    Width: ['None selected', 'Too narrow', 'Slightly Narrow', 'Perfect', 'Slightly wide', 'Too wide'],
    Comfort: ['None selected', 'Uncomfortable', 'Slightyly uncomfortable', 'Ok', 'Comfortable', 'Perfect'],
    Quality: ['None selected', 'Poor', 'Below average', 'What I expected', 'Pretty Great', 'Perfect'],
    Length: ['None selected', 'Runs Short', 'Runs slightly short', 'Perfect', 'Runs slightly long', 'Runs long'],
    Fit: ['None selected', 'Runs tight', 'Runs slightly tight', 'Perfect', 'Runs slightly loose', 'Runs loose']
  }

  const handleSelect = function(e, currentChar) {
    const newCurrentSelection = {...currentSelection};
    newCurrentSelection[currentChar] = parseInt(e.target.value);
    setCurrentSelection(newCurrentSelection);
  }

  const handleBody = function(e) {
    e.preventDefault()
    setBody(e.target.value)
  }

  const handleStars = function(e, position) {
    let stars = parseInt(e.target.value);
    // console.log('Stars ', stars);
    let updatedStarArray = [...starArray].map((star) => {
      if (stars > 0) {
        stars--;
        return 1;
      } else {
        return 0;
      }
    })
    // console.log(updatedStarArray);
    // setStarCount(parseInt(e.target.value));
    setStarArray(updatedStarArray);
  }

  const formSubmit = function(e) {
    e.preventDefault()
    let newReview = new FormData(e.target);
    let newObj = createParameters(newReview)
    console.log(newObj);
    if (newObj) {
      const auth = {'Authorization': process.env.GITHUB_TOKEN}
      const url = `https://app-hrsei-api.herokuapp.com/api/fec2/hr-rfp/reviews`;
      axios({method: 'post', url: url, headers: auth, data: newObj})
        .then((res) => {
          console.log('review POST response', res);
          setRList();
        })
        .catch(err => {
          console.error('ERROR', err);
          alert('Didn\'t Post Review' + err);
        })
    }
    setIsOpen(false);
    setImages([]);
    setCurrentSelection({
      Size: 0,
      Width: 0,
      Comfort: 0,
      Quality: 0,
      Length: 0,
      Fit: 0
    })
    setBody('')
    setStarArray([1, 0, 0, 0, 0])
  }

  const createParameters = function(formData) {
    let parameters = {product_id: id, characteristics: {}}
    let charID = []
    for (let key in charObj) {
      charID.push(charObj[key].id);
    }
    for (const [key, value] of formData) {
      if (charID.includes(parseInt(key))) {
        parameters.characteristics[key] = parseInt(value)
      } else if (key === 'rating') {
        parameters[key] = parseInt(value)
      } else if (key === 'recommend') {
        parameters[key] = (value === 'true')
      } else if (key === 'photos') {
        parameters[key] = images;
      } else {
        parameters[key] = value
      }
    }
    return parameters;
  }

  const imagehandler = function(e, action) {
    e.preventDefault();
    let imgUrl = $('#photos').val();
    const updatedImages = [...images]
    if (action === 'add') {
      updatedImages.push(imgUrl)
    } else if (action === 'del') {
      updatedImages.pop()
    }
    setImage('');
    setImages(updatedImages);
  }

  // console.log(starArray);

  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div className='qa-modal modal-bg'>
      <span onClick={(e) => {e.preventDefault(); setIsOpen(false)}} id='pop-up-exit'>X</span>
      <div className='modal-content review-modal-specs'>
        <FormHeader>
          <span>
            Write your review about the
            <span> {name}</span>
          </span>
        </FormHeader>
        <AddReview onSubmit={formSubmit}>
          <FormRatingCont>
            <label>
              * Overall Rating:
            </label>
            <StarAndDefCont>
              <div>
                {starArray.map((star, index) => {
                  return (
                    <span key={index}>
                      <NoRadioButton
                        type="radio"
                        value={index + 1}
                        id={`star-${index+1}`}
                        name="rating"
                        defaultChecked={index === 0}
                        onChange={(e) => handleStars(e)}
                        required>
                      </NoRadioButton>
                      <label htmlFor={`star-${index+1}`}>
                        <SingleStarContainer>
                          <SingleStarFill
                            style={{"width" : `${parseInt(star*40)}px`}}>
                            <StarImg
                              src="../../client/dist/images/star2.png" alt="stars alt">
                            </StarImg>
                          </SingleStarFill>
                        </SingleStarContainer>
                      </label>
                    </span>
                  )
                })}
              </div>
              <StarDef>
                <span>5: Great</span>
                <span>4: Good</span>
                <span>3: Average</span>
                <span>2: Fair</span>
                <span>1: Poor</span>
              </StarDef>
            </StarAndDefCont>
          </FormRatingCont>
          <div>
            <FormRecommend>
              <label>* Do you recommend this product?</label>
            </FormRecommend>
            <FormRecommendInput>
              <input type="radio" id="yes" name="recommend" value="true" required></input>
              <label htmlFor="yes">Yes</label>
              <input type="radio" id="no" name="recommend" value="false"></input>
              <label htmlFor="no">No</label>
            </FormRecommendInput>
          </div>
          <FormCharCont>
            <FormCategory>
              * Characteristics:
            </FormCategory>
            {chars.length === 0 && <div>No characteristics at this time</div>}
            <IndCharCont>
              {chars.length >= 1 &&
                chars.map((char, index) => {
                  return (
                    <IndChar key={index}>
                      <div style={{"marginRight": "60px"}}>
                        <label>
                          {char}:
                          <CharSelected>
                              {charChart[char][currentSelection[char]]}
                          </CharSelected>
                        </label>
                        <div>
                          <input
                            type="radio"
                            value="1"
                            id={`${char}-1`}
                            onChange={(e) => handleSelect(e, char)}
                            name={charObj[char].id}
                            required>
                          </input>
                          <label htmlFor={`${char}-1`}>1</label>
                          <input
                            type="radio"
                            value="2"
                            id={`${char}-2`}
                            onChange={(e) => handleSelect(e, char)}
                            name={charObj[char].id}>
                          </input>
                          <label htmlFor={`${char}-2`}>2</label>
                          <input
                            type="radio"
                            value="3"
                            id={`${char}-3`}
                            onChange={(e) => handleSelect(e, char)}
                            name={charObj[char].id}>
                          </input>
                          <label htmlFor={`${char}-3`}>3</label>
                          <input
                            type="radio"
                            value="4"
                            id={`${char}-4`}
                            onChange={(e) => handleSelect(e, char)}
                            name={charObj[char].id}>
                          </input>
                          <label htmlFor={`${char}-4`}>4</label>
                          <input
                            type="radio"
                            value="5"
                            id={`${char}-5`}
                            onChange={(e) => handleSelect(e, char)}
                            name={charObj[char].id}>
                          </input>
                          <label htmlFor={`${char}-5`}>5</label>
                        </div>
                      </div>
                      <CharDefinition>
                        <span>1: {charChart[char][1]}</span>
                        <span>2: {charChart[char][3]}</span>
                        <span>3: {charChart[char][5]}</span>
                      </CharDefinition>
                    </IndChar>
                  )
                })
              }
            </IndCharCont>
          </FormCharCont>
          <SingleLineInput>
            <FormCategory>
              * Review Summary:
            </FormCategory>
            <SingleLineInputSpec type="text" name="summary" placeholder="Best purchase ever!!!" maxLength="60" required></SingleLineInputSpec>
          </SingleLineInput>
          <FormBodyCont>
            <FormCategory>
              * Review Body:
            </FormCategory>
            <FormBodyInput>
              <textarea
                name="body"
                minLength="50"
                maxLength="1000"
                value={body}
                onChange={handleBody}
                placeholder="Why did you like the product or not?"
                required>
              </textarea>
              { body.length < 50 &&
                <span>Minimum required characters left: [{50-body.length}]</span>
              }
              { body.length > 50 &&
                <span>Minimum Reached</span>
              }
            </FormBodyInput>
          </FormBodyCont>
          <PhotosCont>
            <FormCategory>
              Upload Photos:
            </FormCategory>
            <SingleLineInputSpec
              name="photos"
              id="photos"
              type="input"
              minLength="3"
              value={image}
              onChange={(e) => {setImage(e.target.value)}}
              placeholder={`You can add ${5 - images.length} more images!`}>
            </SingleLineInputSpec>
            <ButtonsCont>
              {images.length < 5 &&
                <span
                  style={{"border": "gray solid 3px"}}
                  onClick={(e) => imagehandler(e, 'add')}>
                  Add Image
                </span>
              }
              {images.length > 0 &&
                <span
                  style={{"border": "gray solid 3px"}}
                  onClick={(e) => imagehandler(e, 'del')}>
                  Remove Image: [{images.length}]
                </span>
              }
            </ButtonsCont>
          </PhotosCont>
          <UserInfo>
            <SingleLineInput>
              <FormCategory>
                * Nickname:
              </FormCategory>
              <SingleLineInputSpec type="text" name="name" placeholder="jackson11" maxLength="60" required></SingleLineInputSpec>
            </SingleLineInput>
            <Warning>
              For privacy reasons do not use your real name or email.
            </Warning>
          </UserInfo>
          <UserInfo>
            <SingleLineInput>
              <FormCategory>
                * email:
              </FormCategory>
              <SingleLineInputSpec type="email" name="email" placeholder="jackson11@gmail.com" maxLength="60" required></SingleLineInputSpec>
            </SingleLineInput>
            <Warning>
              For authentication reasons, you will not be emailed.
            </Warning>
          </UserInfo>
          <SubmitButton
            type="submit"
            value="Submit">
          </SubmitButton>
        </AddReview>
      </div>
    </div>,
    document.getElementById('pop-up')
  )
}

export default ReviewModal;


const FormHeader = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  font-size: 30px;
  padding: 5px;
   & > span > span {
    text-decoration: underline;
   }
`

const AddReview = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 75%;
  max-height: 600px;
  overflow: auto;
  margin: 7% 0%;
  padding: 5px;
  width: 70%;
  border-radius: 5px;
    & > div {
      margin-bottom: 20px;
    }
`

const FormRatingCont = styled.div`
  display: flex;
  flex-direction: column;
    & > label {
      font-size: 30px;
    }
`

const StarAndDefCont = styled.div`
  display: flex;
  margin-top: 5px;
    & > div {
      margin-right: 60px;
      margin-left: 20px;
    }
`

const StarDef = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 14px;
`

const NoRadioButton = styled.input`
  display: none;
`

const SingleStarContainer = styled.div`
  height: 47.3px;
  width: 40px;
  display: inline-block;
`

const SingleStarFill = styled.div`
  position: relative;
  display: inline-block;
  height: 47.3px;
  background-color: black;
`

const StarImg = styled.img`
  height: 47.3px;
  width: 40px;
`

const FormRecommend = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 30px;
`

const FormRecommendInput = styled.div`
  margin-left: 20px;
  margin-top: 5px;
  font-family: 'Varela Round', sans-serif;
`

const FormCharCont = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const IndCharCont = styled.div`
  padding-left: 20px;
  margin-top: 5px;
  display: flex;
  flex-direction: column;
`

const IndChar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 5px;
  font-family: 'Varela Round', sans-serif;
    & > div > label {
      flex-direction: row;
      display: flex;
      align-items: center;
    }
`

const CharSelected = styled.span`
  font-size: 12px;
  margin-left: 5px;
`

const CharDefinition = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 14px;
`

const FormCategory = styled.label`
  font-size: 30px;
`

const SingleLineInput = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`

const SingleLineInputSpec = styled.input`
  width: 90%;
  padding: 1px 10px;
  margin: 1px auto;
  font-family: 'Varela Round', sans-serif;
  padding: 10px;
  margin: 5px auto 1px auto;
`

const Warning = styled.div`
  font-size: 10px;
  font-family: 'Varela Round', sans-serif;
  color: red;
  text-align: left;
  width: 90%;
  padding: 1px 10px;
  margin: 1px auto;
`

const FormBodyCont = styled.div`
  display: flex;
  flex-direction: column;
`

const FormBodyInput = styled.div`
  display: flex;
  margin-top: 5px;
  flex-direction: column;
  font-family: 'Varela Round', sans-serif;
    & > textarea {
      width: 90%;
      height: 100px;
      margin: 1px auto;
      font-family: 'Varela Round', sans-serif;
      padding: 10px;
      margin: 5px auto 1px auto;
    }
    & > span {
      text-align: right;
      font-size: 10px;
      width: 90%;
      margin: 1px auto;
    }
`

const PhotosCont = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const ButtonsCont = styled.div`
  margin: 0px auto;
  display: flex;
  justify-content: space-around;
  width: 35%;
  font-family: 'Varela Round', sans-serif;
    & > span {
      border-radius: 5px;
      padding: 3px;
      font-size: 14px;
      margin: 5px 5px;
      background-color: buttonface;
      cursor: default;
    }
`

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const SubmitButton = styled.input`
  margin: 0px auto;
  display: flex;
  justify-content: space-around;
  width: 35%;
  font-family: 'Varela Round', sans-serif;
  border: gray solid 3px;
  border-radius: 5px;
`