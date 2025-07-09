import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "./use-toast.jsx";
import { BASE_URL } from "@/lib/utils.js";
import { useRouter } from "next/navigation.js";

// Replace with your actual API endpoint

const postReport = async (reportData) => {
  const response = await axios.post(`${BASE_URL}/reports/`, reportData);
  return response.data;
};

export default function useReportIssue() {
  const router = useRouter()
  return useMutation({
    mutationFn: postReport,
    onSuccess: (data) => {
      toast({
        title: "Report submitted",
        description: "Your report has been successfully submitted.",
      });
      router.push(`/emergency/report-confirmation?id=${data.data.id}`)
    },
    onError: (error) => {
        console.log("err", error.message)
      toast({
        title: "Submission failed",
        description: error?.response?.data?.message || error.message || "An error occurred while submitting your report.",
      });
    },
  });
}
