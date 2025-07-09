import { Button } from "@/components/ui/button";
import { servicesManager } from "@/service/service-manager";

const Test = () => {
  const uploadData = async () => {
    const input: HTMLInputElement = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const result = await servicesManager.RISService.uploadJson(file);
          console.log(result);
        } catch (err) {
          console.error(err);
        }
      }
    };
    input.click();
  };
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "red",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Button onClick={uploadData}>upload</Button>
    </div>
  );
};

export default Test;
