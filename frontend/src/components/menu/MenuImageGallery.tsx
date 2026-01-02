import { useState } from 'react';
import { Box, IconButton, MobileStepper } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

interface MenuImageGalleryProps {
  images: string[];
  name: string;
}

export function MenuImageGallery({ images, name }: MenuImageGalleryProps) {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  if (images.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 400,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        画像なし
      </Box>
    );
  }

  if (images.length === 1) {
    return (
      <Box
        component="img"
        src={images[0]}
        alt={name}
        loading="lazy"
        sx={{
          width: '100%',
          height: 400,
          objectFit: 'contain',
          bgcolor: 'grey.100',
        }}
      />
    );
  }

  return (
    <Box>
      <Box
        component="img"
        src={images[activeStep]}
        alt={`${name} - ${activeStep + 1}`}
        loading="lazy"
        sx={{
          width: '100%',
          height: 400,
          objectFit: 'contain',
          bgcolor: 'grey.100',
        }}
      />
      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <IconButton
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            <KeyboardArrowRight />
          </IconButton>
        }
        backButton={
          <IconButton
            size="small"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            <KeyboardArrowLeft />
          </IconButton>
        }
      />
    </Box>
  );
}
