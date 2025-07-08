import React, { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, UserPlus, Trash, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const isMobile = useIsMobile(); // Hook phân biệt mobile/desktop
    const [selectedUser, setSelectedUser] = useState<{ id: string; email: string; isAdmin: boolean } | null>(null);
    const [emailInput, setEmailInput] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);

    // Mock danh sách người dùng
    const users = [
        { id: "1", email: "user1@gmail.com", name: "User 1", isAdmin: false },
        { id: "2", email: "user2@gmail.com", name: "User 2", isAdmin: true },
        { id: "3", email: "user3@gmail.com", name: "User 3", isAdmin: false },
    ];

    // Mock tìm kiếm người dùng
    const searchUsers = (query: string) => {
        if (!query) return [];
        return users.filter(
            (user) =>
                user.email.toLowerCase().includes(query.toLowerCase()) ||
                user.name.toLowerCase().includes(query.toLowerCase())
        );
    };

    const suggestions = searchUsers(emailInput);

    // Xử lý chọn người dùng
    const handleSelectUser = (user: { id: string; email: string; name: string; isAdmin: boolean }) => {
        setSelectedUser(user);
        setEmailInput(user.email);
        setShowSuggestions(false);
    };

    // Xử lý mời người dùng
    const handleInviteUser = () => {
        if (!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
            alert("Vui lòng nhập email hợp lệ");
            return;
        }
        if (!selectedUser && !users.some((u) => u.email === emailInput)) {
            console.log(`Inviting new user with email: ${emailInput}`);
            setEmailInput("");
            setShowSuggestions(false);
        } else if (selectedUser) {
            console.log(`Selected existing user: ${selectedUser.email}`);
        }
    };

    // Xử lý cấp quyền admin
    const handlePromoteToAdmin = () => {
        if (selectedUser) {
            console.log(`Promoting user ${selectedUser.email} to admin`);
            setSelectedUser(null);
            setEmailInput("");
            setShowSuggestions(false);
        }
    };

    // Xử lý xóa người dùng
    const handleDeleteUser = () => {
        if (selectedUser) {
            console.log(`Deleting user ${selectedUser.email}`);
            setSelectedUser(null);
            setEmailInput("");
            setShowSuggestions(false);
        }
    };

    // Xử lý chọn file
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

    // Xử lý hành động huấn luyện
    const handleTrainingAction = (action: "add" | "replace" | "cleanup") => {
        if (action !== "cleanup" && !file) {
            alert("Vui lòng chọn file JSON trước");
            return;
        }
        switch (action) {
            case "add":
                console.log("Adding training data:", file);
                break;
            case "replace":
                console.log("Replacing training data:", file);
                break;
            case "cleanup":
                console.log("Cleaning up training data");
                break;
        }
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Đảm bảo input không bị che bởi bàn phím ảo trên mobile
    useEffect(() => {
        if (isMobile) {
            const handleKeyboardOpen = () => {
                if (emailInputRef.current && document.activeElement === emailInputRef.current) {
                    emailInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            };
            window.addEventListener("resize", handleKeyboardOpen);
            return () => window.removeEventListener("resize", handleKeyboardOpen);
        }
    }, [isMobile]);
    //bg-background 
    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className={`fixed inset-0 bg-black/35 dark:bg-white/15`} />
                <Dialog.Content
                    className={`fixed bg-sidebar left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-lg shadow-lg overflow-y-auto ${isMobile
                        ? "w-full max-w-[95vw] h-[90vh] p-3"
                        : "w-[90vw] max-w-md max-h-[80vh] p-6"
                        }`}
                >
                    <Dialog.Title
                        className={`font-semibold text-gray-900 dark:text-white ${isMobile ? "text-base" : "text-xl"
                            }`}
                    >
                        Cài đặt Quản trị
                    </Dialog.Title>
                    <Dialog.Description
                        className={`mt-1 text-gray-500 dark:text-gray-400 ${isMobile ? "text-xs" : "text-sm"
                            }`}
                    >
                        Quản lý người dùng và dữ liệu huấn luyện AI.
                    </Dialog.Description>

                    <div className={`mt-${isMobile ? "3" : "6"} space-y-${isMobile ? "4" : "6"}`}>
                        {/* User Management Section */}
                        <div>
                            <h3
                                className={`font-medium text-gray-700 dark:text-gray-200 ${isMobile ? "text-xs" : "text-base"
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
                                            setShowSuggestions(true);
                                        }}
                                        className={`block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? "py-1.5 px-2 text-sm" : "py-2.5 px-3 text-sm"
                                            }`}
                                        aria-label="Nhập email để mời hoặc chọn người dùng"
                                    />
                                    {emailInput && showSuggestions && suggestions.length > 0 && (
                                        <ul
                                            className={`absolute z-20 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg overflow-y-auto ${isMobile ? "max-h-28" : "max-h-40"
                                                }`}
                                        >
                                            {suggestions.map((user) => (
                                                <li
                                                    key={user.id}
                                                    onClick={() => handleSelectUser(user)}
                                                    className={`px-${isMobile ? "2" : "3"} py-${isMobile ? "1.5" : "2"
                                                        } text-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center ${isMobile ? "min-h-[36px]" : "min-h-[40px]"
                                                        }`}
                                                >
                                                    {user.name} ({user.email}) {user.isAdmin ? "(Admin)" : ""}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <div
                                    className={`flex gap-2 ${isMobile ? "flex-col" : "flex-row"}`}
                                >
                                    <Button
                                        onClick={handleInviteUser}
                                        disabled={!emailInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)}
                                        className={`${isMobile ? "h-10 min-h-[44px]" : "h-9"
                                            } bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 text-sm flex-1`}
                                        aria-label={selectedUser ? "Chọn người dùng" : "Mời người dùng mới"}
                                    >
                                        <UserPlus className="h-4 w-4 mr-1.5" />
                                        {selectedUser ? "Chọn" : "Mời"}
                                    </Button>
                                    <Button
                                        onClick={handlePromoteToAdmin}
                                        disabled={!selectedUser || selectedUser.isAdmin}
                                        className={`${isMobile ? "h-10 min-h-[44px]" : "h-9"
                                            } bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 text-sm flex-1`}
                                    >
                                        <UserPlus className="h-4 w-4 mr-1.5" />
                                        Lên Admin
                                    </Button>
                                    <Button
                                        onClick={handleDeleteUser}
                                        disabled={!selectedUser}
                                        className={`${isMobile ? "h-10 min-h-[44px]" : "h-9"
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
                                className={`font-medium text-gray-700 dark:text-gray-200 ${isMobile ? "text-xs" : "text-base"
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
                                        className={`block w-full text-${isMobile ? "xs" : "sm"
                                            } text-gray-500 file:mr-${isMobile ? "2" : "4"
                                            } file:py-${isMobile ? "1.5" : "2.5"} file:px-${isMobile ? "2" : "4"
                                            } file:rounded-md file:border-0 file:text-${isMobile ? "xs" : "sm"
                                            } file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-blue-300 dark:hover:file:bg-gray-600`}
                                    />
                                    {file && (
                                        <span
                                            className={`text-${isMobile ? "xs" : "sm"
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
                                        className={`${isMobile ? "h-10 min-h-[44px]" : "h-9"
                                            } bg-blue-500 text-white hover:bg-blue-600 text-sm flex-1`}
                                    >
                                        Thêm
                                    </Button>
                                    <Button
                                        onClick={() => handleTrainingAction("replace")}
                                        className={`${isMobile ? "h-10 min-h-[44px]" : "h-9"
                                            } bg-purple-500 text-white hover:bg-purple-600 text-sm flex-1`}
                                    >
                                        Thay thế
                                    </Button>
                                    <Button
                                        onClick={() => handleTrainingAction("cleanup")}
                                        className={`${isMobile ? "h-10 min-h-[44px]" : "h-9"
                                            } bg-orange-500 text-white hover:bg-orange-600 text-sm flex-1`}
                                    >
                                        Dọn dẹp
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`mt-${isMobile ? "3" : "6"} flex justify-end`}
                    >
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className={`${isMobile ? "h-10 min-h-[44px] px-3" : "h-9 px-4"
                                } text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 text-sm`}
                        >
                            Đóng
                        </Button>
                    </div>

                    <Dialog.Close asChild>
                        <button
                            className={`absolute right-${isMobile ? "2" : "4"
                                } top-${isMobile ? "2" : "4"
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