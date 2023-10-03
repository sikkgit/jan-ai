import { Product } from "@/_models/Product";
import { executeSerial } from "@/_services/pluginService";
import { ModelManagementService } from "../../shared/coreService";
import { useEffect, useState } from "react";
import { getModelFiles } from "./useGetDownloadedModels";
import { useAtomValue } from "jotai";
import { modelDownloadStateAtom } from "@/_helpers/atoms/DownloadState.atom";

export default function useGetAvailableModels() {
  const downloadState = useAtomValue(modelDownloadStateAtom);
  const [allAvailableModels, setAllAvailableModels] = useState<Product[]>([]);
  const [availableModels, setAvailableModels] = useState<Product[]>([]);
  const [downloadedModels, setDownloadedModels] = useState<Product[]>([]);

  const getAvailableModelExceptDownloaded = async () => {
    const avails = await getAvailableModels();
    const downloaded = await getModelFiles();

    setAllAvailableModels(avails);
    const availableOrDownloadingModels: Product[] = avails;
    const successfullDownloadModels: Product[] = [];

    downloaded.forEach((item) => {
      if (item.fileName && downloadState[item.fileName] == null) {
        // if not downloading, consider as downloaded
        successfullDownloadModels.push(item);
      } else {
        availableOrDownloadingModels.push(item);
      }
    });

    setAvailableModels(availableOrDownloadingModels);
    setDownloadedModels(successfullDownloadModels);
  };

  useEffect(() => {
    getAvailableModelExceptDownloaded();
  }, []);

  return {
    allAvailableModels,
    availableModels,
    downloadedModels,
    getAvailableModelExceptDownloaded,
  };
}

export async function getAvailableModels(): Promise<Product[]> {
  const avails: Product[] = await executeSerial(
    ModelManagementService.GET_AVAILABLE_MODELS
  );

  return avails ?? [];
}
