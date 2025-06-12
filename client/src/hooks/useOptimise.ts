import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
const useOptimise = (projectId: string) => {
  const { t } = useTranslation();
  const token = localStorage.getItem("authToken") || "";
  const [step, setStep] = useState(0);
  const clientRef = useRef<any>(null);
  useEffect(() => {
    if (!projectId || clientRef.current) return;

    const socket = new SockJS("/ws");
    const client = Stomp.over(socket);

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        client.subscribe(`/topic/optimiseSteps/${projectId}`, (message) => {
          const s = JSON.parse(message.body);
          setStep(s);
        });
      },
      (error: any) => {
        console.error("Optimisation WebSocket error:", error);
      }
    );

    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect(() => {
        });
        clientRef.current = null;
      }
    };
  }, [projectId, token]);


  const optimise = async (
    projectId: string,
    isCollab: boolean,
    isResource: boolean
  ) => {
    const response = await fetch(`/api/optimise/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectID: projectId,
        optCollab: isCollab,
        optResource: isResource,
      }),
    });
    if (!response.ok) {
      throw new Error(t("optimise.error"));
    }
    const data = await response.json();
    return data;
  };


  const saveChanges = async (
    result: any,
    isCollab: boolean,
    isResource: boolean
  ) => {
    const response = await fetch(`/api/optimise/save`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        result: result,
        optCollab: isCollab,
        optResource: isResource,
      }),
    });

    if (!response.ok) {
      throw new Error(t("optimise.error"));
    }
    
    return true;
  };



  return {
    saveChanges,
    optimise,
    step,
    setStep,
  };
};



export default useOptimise;
