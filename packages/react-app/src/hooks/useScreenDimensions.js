import { useEffect, useState } from "react";

export const useScreenDimensions = () => {
  const [appContainerDiv, setAppContainerDiv] = useState(null);
  const [screenDimensions, setScreenDimensions] = useState({ width: null, height: null });

  useEffect(() => {
    const appDiv = document.getElementById("app-container");
    setAppContainerDiv(appDiv);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setScreenDimensions({
        width: appContainerDiv.offsetWidth,
        height: appContainerDiv.offsetHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [appContainerDiv]);

  useEffect(() => {
    if (appContainerDiv) {
      setScreenDimensions({
        width: appContainerDiv.offsetWidth,
        height: appContainerDiv.offsetHeight,
      });
    }
  }, [appContainerDiv]);

  return screenDimensions;
};
