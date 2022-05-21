import React from 'react'
import Slider from 'react-rangeslider'

const RangeSlider = ({ rangeValue, handleChange }) => {
  // const [value, setValue] = useState(10);

  // const handleChangeStart = () => {
  //   console.log('Change event started')
  // };

  // const handleChangeComplete = () => {
  //   console.log('Change event completed')
  // };
  return (
    <div className='slider'>
      <div className='value'>{rangeValue} %</div>
      <Slider
        min={0}
        max={100}
        value={rangeValue}
        // onChangeStart={handleChangeStart}
        onChange={(value) => handleChange(Math.floor(value))}
      // onChangeComplete={handleChangeComplete}
      />
    </div>
  )
}

export default RangeSlider
