import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import Button from "@/Components/Common/Button";
import PageHeader from "@/Components/Common/PageHeader";
import FormCard from "@/Components/Common/FormCard";
import useImagePreview from "@/Hooks/useImagePreview";
import toast from "react-hot-toast";
import {
    IconCategory,
    IconDeviceFloppy,
    IconPhoto,
} from "@tabler/icons-react";

export default function Create() {
    const { errors } = usePage().props;

    const { data, setData, post, processing } = useForm({
        name: "",
        description: "",
        image: "",
    });

    const { preview, handleImageChange: updatePreview } = useImagePreview();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            updatePreview(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("categories.store"), {
            onSuccess: () => toast.success("Kategori berhasil ditambahkan"),
            onError: () => toast.error("Gagal menyimpan kategori"),
        });
    };

    return (
        <>
            <Head title="Tambah Kategori" />

            <PageHeader
                backRoute="categories.index"
                backLabel="Kembali ke Kategori"
                title="Tambah Kategori Baru"
                icon={IconCategory}
            />

            <form onSubmit={submit}>
                <FormCard maxWidth="2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Image */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <IconPhoto size={16} />
                                    Gambar
                                </h3>
                                <div className="aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden mb-3">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <IconPhoto
                                            size={32}
                                            className="text-slate-400"
                                        />
                                    )}
                                </div>
                                <Input
                                    type="file"
                                    onChange={handleImageChange}
                                    errors={errors.image}
                                    accept="image/*"
                                />
                            </div>

                            {/* Info */}
                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    label="Nama Kategori"
                                    placeholder="Masukkan nama"
                                    errors={errors.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    value={data.name}
                                />
                                <Textarea
                                    label="Deskripsi"
                                    placeholder="Deskripsi kategori"
                                    errors={errors.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    value={data.description}
                                    rows={4}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = route("categories.index")}
                                type="button"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={processing}
                            >
                                <IconDeviceFloppy size={18} />
                                {processing ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </div>
                </FormCard>
            </form>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
