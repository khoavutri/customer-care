import React, { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, UserPlus, Trash, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import useDebounce from "@/hooks/useDebounce";
import { servicesManager } from "@/service/service-manager";
import { toast } from "sonner";
import { useLoading } from "@/contexts/LoadingContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const isMobile = useIsMobile();
  const { setLoading } = useLoading();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [emailInput, setEmailInput] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const debouncedEmailInput = useDebounce<string>(emailInput, 600);

  const [users, setUsers] = useState<Array<any>>([]);

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setEmailInput(user.email);
    setShowSuggestions(false);
  };

  const handlePromoteToAdmin = async () => {
    if (selectedUser) {
      const action = await servicesManager.RISService.grantAdmin(
        selectedUser.id
      );

      if (action && action.status === 1) {
        toast("Cấp quyền admin thành công!");
      } else {
        toast("Cấp quyền admin không thành công!");
      }

      setSelectedUser(null);
      setEmailInput("");
      setShowSuggestions(false);
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      const action = await servicesManager.RISService.deleteUser(
        selectedUser.id
      );

      if (action && action.status === 1) {
        toast("xóa người dùng thành công!");
      } else {
        toast("xóa người dùng không thành công!");
      }
      setSelectedUser(null);
      setEmailInput("");
      setShowSuggestions(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/json") {
        setFile(selectedFile);
      } else {
        alert("Vui lòng chọn file JSON");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleTrainingAction = async (action: "add" | "cleanup") => {
    if (action !== "cleanup" && !file) {
      toast("File json chưa tồn tại!");
      return;
    }

    switch (action) {
      case "add":
        onClose();
        setLoading(true);
        const result = await servicesManager.RISService.uploadJson(file);
        if (result && result.status === 1) {
          setFile(null);
          setLoading(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
          toast("Thêm dữ liệu thành công!");
        } else {
          setLoading(false);
          toast("Thêm dữ liệu không thành công!");
        }
        break;
      case "cleanup":
        const action = await servicesManager.RISService.cleanUp();
        if (action && action.status === 1) {
          toast("Xóa dữ liệu thành công!");
        } else {
          toast("Xóa dữ liệu không thành công!");
        }
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        break;
    }
  };

  const fetchUserList = async (emailz: string) => {
    const action = await servicesManager.RISService.getUserList({
      email: emailz,
    });

    if (action && action.status === 1) {
      setUsers(action.data.users);
    }
  };

  useEffect(() => {
    if (isMobile) {
      const handleKeyboardOpen = () => {
        if (
          emailInputRef.current &&
          document.activeElement === emailInputRef.current
        ) {
          emailInputRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      };
      window.addEventListener("resize", handleKeyboardOpen);
      return () => window.removeEventListener("resize", handleKeyboardOpen);
    }
  }, [isMobile]);

  useEffect(() => {
    if (debouncedEmailInput && !selectedUser) {
      setShowSuggestions(true);
      fetchUserList(debouncedEmailInput);
    } else {
      setShowSuggestions(false);
    }
  }, [debouncedEmailInput, selectedUser]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={`fixed inset-0 bg-black/35 dark:bg-white/15`}
        />
        <Dialog.Content
          className={`fixed bg-sidebar left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-lg shadow-lg overflow-y-auto ${
            isMobile
              ? "w-full max-w-[95vw] h-[90vh] p-3"
              : "w-[90vw] max-w-md max-h-[80vh] p-6"
          }`}
        >
          <Dialog.Title
            className={`font-semibold text-gray-900 dark:text-white ${
              isMobile ? "text-base" : "text-xl"
            }`}
          >
            Cài đặt Quản trị
          </Dialog.Title>
          <Dialog.Description
            className={`mt-1 text-gray-500 dark:text-gray-400 ${
              isMobile ? "text-xs" : "text-sm"
            }`}
          >
            Quản lý người dùng và dữ liệu huấn luyện AI.
          </Dialog.Description>

          <div
            className={`mt-${isMobile ? "3" : "6"} space-y-${
              isMobile ? "4" : "6"
            }`}
          >
            {/* User Management Section */}
            <div>
              <h3
                className={`font-medium text-gray-700 dark:text-gray-200 ${
                  isMobile ? "text-xs" : "text-base"
                }`}
              >
                Quản lý Người dùng
              </h3>
              <div className={`mt-2 space-y-${isMobile ? "2" : "3"}`}>
                <div className="relative">
                  <input
                    ref={emailInputRef}
                    type="email"
                    inputMode="email"
                    autoCapitalize="none"
                    placeholder="Nhập email (ví dụ: user@gmail.com)"
                    value={emailInput}
                    onChange={(e) => {
                      setEmailInput(e.target.value);
                      setSelectedUser(null);
                    }}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                      selectedUser
                        ? "bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        : "bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    } ${
                      isMobile ? "py-1.5 px-2 text-sm" : "py-2.5 px-3 text-sm"
                    }`}
                    aria-label="Nhập email để mời hoặc chọn người dùng"
                  />
                  {emailInput && showSuggestions && users.length > 0 && (
                    <ul
                      className={`absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg overflow-y-auto ${
                        isMobile ? "max-h-28" : "max-h-40"
                      }`}
                    >
                      {users.map((user, index) => (
                        <li
                          key={index}
                          onClick={() => handleSelectUser(user)}
                          className={`px-${isMobile ? "2" : "3"} py-${
                            isMobile ? "1.5" : "2"
                          } text-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center ${
                            isMobile ? "min-h-[36px]" : "min-h-[40px]"
                          }`}
                        >
                          {user.name} ({user.email}){" "}
                          {user.role === "admin" ? "(Admin)" : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div
                  className={`flex gap-2 ${isMobile ? "flex-col" : "flex-row"}`}
                >
                  <Button
                    onClick={handlePromoteToAdmin}
                    disabled={!selectedUser || selectedUser.role === "admin"}
                    className={`${
                      isMobile ? "h-10 min-h-[44px]" : "h-9"
                    } bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 text-sm flex-1`}
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Cấp quyền
                  </Button>
                  <Button
                    onClick={handleDeleteUser}
                    disabled={!selectedUser}
                    className={`${
                      isMobile ? "h-10 min-h-[44px]" : "h-9"
                    } bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-300 text-sm flex-1`}
                  >
                    <Trash className="h-4 w-4 mr-1.5" />
                    Xóa
                  </Button>
                </div>
              </div>
            </div>

            {/* Model Training Section */}
            <div>
              <h3
                className={`font-medium text-gray-700 dark:text-gray-200 ${
                  isMobile ? "text-xs" : "text-base"
                }`}
              >
                Huấn luyện Mô hình AI
              </h3>
              <div className={`mt-2 space-y-${isMobile ? "2" : "3"}`}>
                <div className={`flex flex-col gap-${isMobile ? "1.5" : "2"}`}>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className={`block w-full text-${
                      isMobile ? "xs" : "sm"
                    } text-gray-500 file:mr-${isMobile ? "2" : "4"} file:py-${
                      isMobile ? "1.5" : "2.5"
                    } file:px-${
                      isMobile ? "2" : "4"
                    } file:rounded-md file:border-0 file:text-${
                      isMobile ? "xs" : "sm"
                    } file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-blue-300 dark:hover:file:bg-gray-600`}
                  />
                  {file && (
                    <span
                      className={`text-${
                        isMobile ? "xs" : "sm"
                      } text-gray-600 dark:text-gray-300 truncate max-w-full`}
                    >
                      {file.name}
                    </span>
                  )}
                </div>
                <div
                  className={`flex gap-2 ${isMobile ? "flex-col" : "flex-row"}`}
                >
                  <Button
                    onClick={() => handleTrainingAction("add")}
                    className={`${
                      isMobile ? "h-10 min-h-[44px]" : "h-9"
                    } bg-blue-500 text-white hover:bg-blue-600 text-sm flex-1`}
                  >
                    Thêm
                  </Button>
                  {/* <Button
                    onClick={() => handleTrainingAction("replace")}
                    className={`${
                      isMobile ? "h-10 min-h-[44px]" : "h-9"
                    } bg-purple-500 text-white hover:bg-purple-600 text-sm flex-1`}
                  >
                    Thay thế
                  </Button> */}
                  <Button
                    onClick={() => handleTrainingAction("cleanup")}
                    className={`${
                      isMobile ? "h-10 min-h-[44px]" : "h-9"
                    } bg-orange-500 text-white hover:bg-orange-600 text-sm flex-1`}
                  >
                    Dọn dẹp
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-${isMobile ? "3" : "6"} flex justify-end`}>
            <Button
              variant="ghost"
              onClick={onClose}
              className={`${
                isMobile ? "h-10 min-h-[44px] px-3" : "h-9 px-4"
              } text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 text-sm`}
            >
              Đóng
            </Button>
          </div>

          <Dialog.Close asChild>
            <button
              className={`absolute right-${isMobile ? "2" : "4"} top-${
                isMobile ? "2" : "4"
              } rounded-sm p-1.5 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SettingsModal;
