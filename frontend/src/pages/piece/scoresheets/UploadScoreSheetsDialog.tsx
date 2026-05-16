/*
 * (C) 2026. - Rafael Urben
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePiecesApi } from "@/api/useAuthenticatedApiClient.ts";
import { Button } from "@/shadcn/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/components/ui/dialog.tsx";
import { Input } from "@/shadcn/components/ui/input.tsx";
import { Label } from "@/shadcn/components/ui/label.tsx";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { toast } from "sonner";
import { Spinner } from "@/shadcn/components/ui/spinner.tsx";
import { ResponseError } from "@/api/generated/openapi";

GlobalWorkerOptions.workerSrc = pdfWorker;

const PDF_RENDER_SCALE = 300 / 72;

interface ConvertedPdfPage {
  pageNumber: number;
  blob: Blob;
  previewUrl: string;
  selected: boolean;
}

interface UploadScoreSheetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pieceId: string;
}

function revokePageUrls(pages: ConvertedPdfPage[]) {
  pages.forEach((page) => {
    URL.revokeObjectURL(page.previewUrl);
  });
}

function baseNameWithoutExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

async function convertPdfToPages(file: File): Promise<ConvertedPdfPage[]> {
  console.log("Converting pdf...");
  const arrayBuffer = await file.arrayBuffer();
  const documentTask = getDocument({
    data: arrayBuffer,
    isEvalSupported: false,
    useSystemFonts: true,
    stopAtErrors: true,
  });
  const pdf = await documentTask.promise;

  const pages: ConvertedPdfPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    console.log(
      `Converting page ${pageNumber.toString()}/${pdf.numPages.toString()}...`,
    );

    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    const canvasContext = canvas.getContext("2d");
    if (!canvasContext) {
      throw new Error("Could not create canvas context for PDF rendering.");
    }

    console.log("Rendering page", pageNumber, canvas.width, canvas.height);

    await page.render({
      canvasContext,
      viewport,
      canvas,
      background: "#ffffff",
      intent: "print",
    }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error("Failed to convert rendered PDF page to image."));
      }, "image/png");
    });

    pages.push({
      pageNumber,
      blob,
      previewUrl: URL.createObjectURL(blob),
      selected: true,
    });
  }

  return pages;
}

export default function UploadScoreSheetsDialog({
  open,
  onOpenChange,
  pieceId,
}: Readonly<UploadScoreSheetsDialogProps>) {
  const piecesApi = usePiecesApi();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [convertedPages, setConvertedPages] = useState<ConvertedPdfPage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const activeConversionIdRef = useRef(0);
  const convertedPagesRef = useRef<ConvertedPdfPage[]>([]);

  useEffect(() => {
    convertedPagesRef.current = convertedPages;
  }, [convertedPages]);

  useEffect(
    () => () => {
      activeConversionIdRef.current += 1;
      revokePageUrls(convertedPagesRef.current);
    },
    [],
  );

  const selectedCount = useMemo(
    () => convertedPages.filter((page) => page.selected).length,
    [convertedPages],
  );

  const clearConvertedPages = () => {
    setConvertedPages((currentPages) => {
      revokePageUrls(currentPages);
      return [];
    });
  };

  const resetDialog = () => {
    activeConversionIdRef.current += 1;
    setPdfFile(null);
    setIsConverting(false);
    setIsUploading(false);
    clearConvertedPages();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetDialog();
    }
    onOpenChange(nextOpen);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Please select a PDF file.");
      return;
    }

    setPdfFile(selectedFile);
    setIsConverting(true);

    const conversionId = activeConversionIdRef.current + 1;
    activeConversionIdRef.current = conversionId;

    try {
      const pages = await convertPdfToPages(selectedFile);

      if (activeConversionIdRef.current !== conversionId) {
        revokePageUrls(pages);
        return;
      }

      setConvertedPages((currentPages) => {
        revokePageUrls(currentPages);
        return pages;
      });
    } catch (error) {
      console.error("Failed to convert PDF:", error);
      toast.error("Failed to convert PDF pages.");
      clearConvertedPages();
    } finally {
      if (activeConversionIdRef.current === conversionId) {
        setIsConverting(false);
      }
    }
  };

  const togglePageSelection = (pageNumber: number) => {
    setConvertedPages((currentPages) =>
      currentPages.map((page) =>
        page.pageNumber === pageNumber
          ? { ...page, selected: !page.selected }
          : page,
      ),
    );
  };

  const setAllPagesSelection = (selected: boolean) => {
    setConvertedPages((currentPages) =>
      currentPages.map((page) => ({ ...page, selected })),
    );
  };

  const handleUpload = async () => {
    if (isUploading || isConverting) return;

    const selectedPages = convertedPages.filter((page) => page.selected);

    if (selectedPages.length === 0) {
      toast.error("Select at least one page to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const fileBaseName = baseNameWithoutExtension(pdfFile?.name ?? "score");
      const files = selectedPages.map(
        (page) =>
          new File(
            [page.blob],
            `${fileBaseName}-page-${String(page.pageNumber).padStart(3, "0")}.png`,
            {
              type: "image/png",
            },
          ),
      );

      await piecesApi.uploadScoreSheets({
        id: pieceId,
        files,
      });

      const uploadedPageCount = String(selectedPages.length);
      toast.success(
        `Uploaded ${uploadedPageCount} page${selectedPages.length === 1 ? "" : "s"}.`,
      );
      handleOpenChange(false);
    } catch (error) {
      if (error instanceof ResponseError && error.response.status === 413) {
        toast.error("File upload failed. Total file size exceeded.");
      } else {
        toast.error("Failed to upload score sheets.");
      }
      console.error("Failed to upload score sheets:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upload score sheets</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-hidden py-2">
          <div className="space-y-2">
            <Label htmlFor="score-sheet-pdf">PDF File</Label>
            <Input
              id="score-sheet-pdf"
              type="file"
              accept="application/pdf"
              disabled={isConverting || isUploading}
              onChange={(event) => {
                void handleFileChange(event);
              }}
            />
          </div>

          {pdfFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {pdfFile.name}
            </p>
          )}

          {isConverting && (
            <div className="text-sm text-muted-foreground flex gap-2">
              <Spinner />
              <span>Converting PDF pages to images...</span>
            </div>
          )}

          {!isConverting && convertedPages.length > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {selectedCount} of {convertedPages.length} page(s) selected
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => {
                      setAllPagesSelection(true);
                    }}
                  >
                    Select all
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => {
                      setAllPagesSelection(false);
                    }}
                  >
                    Select none
                  </Button>
                </div>
              </div>

              <div className="grid max-h-[50vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
                {convertedPages.map((page) => (
                  <div
                    key={page.pageNumber}
                    className="space-y-2 rounded-md border p-3"
                  >
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={page.selected}
                        disabled={isUploading}
                        onChange={() => {
                          togglePageSelection(page.pageNumber);
                        }}
                      />
                      Page {page.pageNumber}
                    </label>
                    <img
                      src={page.previewUrl}
                      alt={`Preview of page ${String(page.pageNumber)}`}
                      className="max-h-72 w-full rounded-md border bg-muted object-contain"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isUploading}
            onClick={() => {
              handleOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={
              isUploading ||
              isConverting ||
              convertedPages.length === 0 ||
              selectedCount === 0
            }
            onClick={() => {
              void handleUpload();
            }}
          >
            {isUploading
              ? "Uploading..."
              : `Upload ${String(selectedCount)} page(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
