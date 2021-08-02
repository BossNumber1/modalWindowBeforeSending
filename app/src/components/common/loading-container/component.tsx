import React from 'react'
import Error from "../error";
import Loader from "../loader";

interface LoadingContainerProps {
  children: React.ReactNode;
  isLoaded: boolean;
  isError: boolean;
  errorMessage?: string;
  redirectPathOnError?: string;
  onErrorClick?: () => void;
}

const LoadingContainer = (props: LoadingContainerProps) => {
  const { children, isLoaded, isError, errorMessage, redirectPathOnError, onErrorClick } =
    props;

  if (isLoaded) {
    return <>{children}</>;
  }

  if (isError) {
    return <Error message={errorMessage} redirectPath={redirectPathOnError} onErrorClick={onErrorClick} />;
  }

  return <Loader />;
};

export default LoadingContainer;
