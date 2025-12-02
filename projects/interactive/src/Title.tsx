import { FunctionComponent } from 'react';
import { UnderlinedHeader } from './components';

const titleImages = [
  'REJECTED.png',
  'WIDOWANDCO.png',
  'InscribedOnRoll.png',
  // 'WARDEPARTMENT.png',
  'further_proof.png',
  'WIDOW_NUMBER.png',
  'INVALID_crop.png',
];

export const Title: FunctionComponent = () => {
  const topRowImages = titleImages.slice(0, 3);
  const bottomRowImages = titleImages.slice(3, 6);

  return (
    <div className="title-wrap">
      <div className="title-images-row title-images-top">
        {topRowImages.map((image, rowIndex) => {
          const globalIndex = rowIndex;
          return (
            <div
              key={image}
              className="title-image-wrapper"
              data-image-index={globalIndex}
            >
              <img
                src={`/title_images/${image}`}
                alt={image}
                className="title-image"
                style={{ maxHeight: '100px', maxWidth: '200px' }}
              />
            </div>
          );
        })}
      </div>
      <div className="title-text">
        <UnderlinedHeader
          text="Bureaucracy in the Revolutionary War Era"
          size="large"
        />
        <h4>The Very Human Burden of Applying for a Pension</h4>
      </div>
      <div className="title-images-row title-images-bottom">
        {bottomRowImages.map((image, rowIndex) => {
          const globalIndex = rowIndex + 3;
          return (
            <div
              key={image}
              className="title-image-wrapper"
              data-image-index={globalIndex}
            >
              <img
                src={`/title_images/${image}`}
                alt={image}
                className="title-image"
                style={{ maxHeight: '100px', maxWidth: '200px' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
