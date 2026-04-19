import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import {
  Zap,
  Building2,
  Trees,
  Droplets,
  Trash2,
  Droplet,
  HelpCircle,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Navigation,
  X,
  ImagePlus,
  Video,
  VideoOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { KNOWN_AREAS, inferWardFromText } from "@/lib/area-ward";
import { WARDS, normalizeWard } from "@/lib/wards";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api-url";

const categories = [
  {
    id: "streetlight",
    label: "Streetlights",
    icon: Zap,
    color: "border-yellow-300 bg-yellow-50 text-yellow-700",
  },
  {
    id: "damaged_wall",
    label: "Damaged Walls",
    icon: Building2,
    color: "border-orange-300 bg-orange-50 text-orange-700",
  },
  {
    id: "park",
    label: "Park / Garden",
    icon: Trees,
    color: "border-green-300 bg-green-50 text-green-700",
  },
  {
    id: "drainage",
    label: "Drainage",
    icon: Droplets,
    color: "border-blue-300 bg-blue-50 text-blue-700",
  },
  {
    id: "road",
    label: "Roads & Potholes",
    icon: Building2,
    color: "border-gray-300 bg-gray-50 text-gray-700",
  },
  {
    id: "garbage",
    label: "Garbage & Waste",
    icon: Trash2,
    color: "border-red-300 bg-red-50 text-red-700",
  },
  {
    id: "water_supply",
    label: "Water Supply",
    icon: Droplet,
    color: "border-cyan-300 bg-cyan-50 text-cyan-700",
  },
  {
    id: "other",
    label: "Other Issues",
    icon: HelpCircle,
    color: "border-purple-300 bg-purple-50 text-purple-700",
  },
];

interface FormData {
  title: string;
  description: string;
  area: string;
  address: string;
  ward: string;
}

export default function ReportPage() {
  const { citizen } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{
    ticketId: string;
    points: number;
  } | null>(null);

  // Location state
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationFetched, setLocationFetched] = useState(false);
  const [wardHint, setWardHint] = useState("");

  // Camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  const addressValue = watch("address", "");
  const areaValue = watch("area", "");
  const wardValue = watch("ward", "");

  const tryAutoAssignWard = useCallback(
    (sourceText: string, showToast = false): string => {
      const inferredWard = inferWardFromText(sourceText);
      if (!inferredWard) return "";

      const currentWard = normalizeWard(wardValue);
      if (currentWard !== inferredWard) {
        setValue("ward", inferredWard, { shouldValidate: true });
      }
      setWardHint(`Auto-assigned to ${inferredWard} based on area/address.`);

      if (showToast) {
        toast.success(`Detected ${inferredWard} from your location details.`);
      }

      return inferredWard;
    },
    [setValue, wardValue],
  );

  const addressField = register("address", {
    required: "Address is required",
  });
  const areaField = register("area", {
    required: "Area / locality is required",
  });

  // ── Auto-fetch location ──────────────────────────────────────────────────
  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode using a free API
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          const addr =
            data.display_name ||
            `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setValue("address", addr);
          tryAutoAssignWard(addr, true);
          setLocationFetched(true);
          toast.success("Location fetched successfully!");
        } catch {
          // Fallback to coordinates
          const coordsText = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setValue(
            "address",
            coordsText,
          );
          tryAutoAssignWard(coordsText);
          setLocationFetched(true);
          toast.success("GPS coordinates captured");
        } finally {
          setFetchingLocation(false);
        }
      },
      (err) => {
        setFetchingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error(
            "Location access blocked. In your browser, click the lock icon in the address bar and allow location, then try again. Or just type your address below.",
            { duration: 6000 },
          );
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          toast.error(
            "Location unavailable. Please type your address manually.",
          );
        } else {
          toast.error("Location timed out. Please type your address manually.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  // ── Camera ───────────────────────────────────────────────────────────────
  const openCamera = useCallback(async () => {
    setCameraError("");
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCameraError(
        msg.includes("Permission") || msg.includes("permission")
          ? "Camera permission denied. Please allow camera access."
          : "Could not access camera. Try uploading a photo instead.",
      );
    }
  }, []);

  const closeCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setCameraOpen(false);
    setCameraError("");
  }, [cameraStream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    if (photos.length < 5) {
      setPhotos((prev) => [...prev, dataUrl]);
      toast.success("Photo captured!");
    } else {
      toast.error("Maximum 5 photos allowed");
    }
    closeCamera();
  }, [photos.length, closeCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - photos.length;
    const toProcess = files.slice(0, remaining);
    toProcess.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = (idx: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== idx));

  // ── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    if (!selectedCategory) {
      toast.error("Please select an issue category");
      return;
    }
    if (!citizen) {
      toast.error("Please login to report an issue");
      navigate("/citizen-login");
      return;
    }
    const combinedText = [data.area, data.address].filter(Boolean).join(" ");
    const inferredWard =
      normalizeWard(data.ward) ||
      inferWardFromText(combinedText) ||
      normalizeWard(citizen.ward);

    if (!inferredWard) {
      toast.error("Please provide area details so ward can be assigned");
      return;
    }
    setValue("ward", inferredWard, { shouldValidate: true });

    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/api/issues"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          citizenId: citizen.id,
          category: selectedCategory,
          ...data,
          ward: inferredWard,
          photoCount: photos.length,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSubmitted({
        ticketId: json.issue.ticketId,
        points: json.issue.pointsAwarded,
      });
      toast.success("Issue reported successfully!");
    } catch (err) {
      toast.error(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Issue Reported!</h2>
          <p className="text-muted-foreground mb-4">
            Your report has been submitted and routed to the concerned
            department.
          </p>
          <div className="bg-primary/5 rounded-xl p-4 mb-6">
            <div className="text-sm text-muted-foreground">Your Ticket ID</div>
            <div className="text-2xl font-bold text-primary font-mono">
              {submitted.ticketId}
            </div>
            <div className="text-sm text-green-600 mt-1">
              +{submitted.points} points earned!
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/track?id=" + submitted.ticketId)}>
              Track This Issue
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(null);
                setSelectedCategory("");
                setPhotos([]);
                setLocationFetched(false);
              }}
            >
              Report Another
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <title>Report an Issue — FixMyCity</title>
      <meta
        name="description"
        content="Report a civic issue in your area to your Nagar Nigam."
      />

      {/* Hidden canvas for camera capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Modal */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-background rounded-2xl overflow-hidden w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Camera className="w-4 h-4" /> Take Photo
                </h3>
                <button
                  onClick={closeCamera}
                  className="p-1 rounded-full hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cameraError ? (
                <div className="p-6 text-center">
                  <VideoOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    {cameraError}
                  </p>
                  <Button variant="outline" onClick={closeCamera}>
                    Close
                  </Button>
                </div>
              ) : (
                <div className="relative bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-video object-cover"
                    onLoadedMetadata={() => videoRef.current?.play()}
                  />
                  {!cameraStream && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              )}

              {!cameraError && (
                <div className="p-4 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={closeCamera}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 gap-2"
                    onClick={capturePhoto}
                    disabled={!cameraStream}
                  >
                    <Camera className="w-4 h-4" /> Capture
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
            <Badge variant="outline" className="mb-2">
              Report Issue
            </Badge>
            <h1 className="text-3xl font-bold">Report a Civic Issue</h1>
            <p className="text-muted-foreground mt-1">
              Fill in the details below. Your report will be routed to the
              concerned department automatically.
            </p>
          </div>

          {!citizen && (
            <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-medium text-yellow-800">
                  You are not logged in.
                </span>
                <span className="text-yellow-700">
                  {" "}
                  <button
                    onClick={() => navigate("/citizen-login")}
                    className="underline font-medium"
                  >
                    Login
                  </button>{" "}
                  to submit a report and earn reward points.
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  1. Select Issue Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`border-2 rounded-lg p-3 text-center transition-all ${selectedCategory === cat.id ? cat.color + " ring-2 ring-primary" : "border-border hover:border-primary/40"}`}
                    >
                      <cat.icon className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-xs font-medium leading-tight">
                        {cat.label}
                      </div>
                    </button>
                  ))}
                </div>
                {!selectedCategory && (
                  <p className="text-xs text-muted-foreground mt-2">
                    * Please select a category
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 2. Issue Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">2. Issue Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Broken streetlight near Main Market"
                    {...register("title", { required: "Title is required" })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    AI will auto-detect the department from your title
                  </p>
                  {errors.title && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue — when noticed, severity, safety concerns, nearby landmarks..."
                    rows={4}
                    {...register("description", {
                      required: "Description is required",
                      minLength: {
                        value: 20,
                        message: "Please provide at least 20 characters",
                      },
                    })}
                    className="mt-1"
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 3. Location */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">3. Location *</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Auto-fetch button */}
                <Button
                  type="button"
                  variant={locationFetched ? "default" : "outline"}
                  className="w-full gap-2"
                  onClick={handleFetchLocation}
                  disabled={fetchingLocation}
                >
                  {fetchingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Fetching
                      location...
                    </>
                  ) : locationFetched ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Location Fetched
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" /> Auto-Fetch My Location
                    </>
                  )}
                </Button>

                {/* Manual address input */}
                <div>
                  <Label htmlFor="area" className="mb-1 block">
                    Area / Locality *
                  </Label>
                  <Input
                    id="area"
                    list="area-options"
                    placeholder="e.g. Karol Bagh, Central Market, Sector 4"
                    value={areaValue}
                    {...areaField}
                    onBlur={(e) => {
                      areaField.onBlur(e);
                      const text = [e.target.value, addressValue]
                        .filter(Boolean)
                        .join(" ");
                      tryAutoAssignWard(text, true);
                    }}
                  />
                  <datalist id="area-options">
                    {KNOWN_AREAS.map((area) => (
                      <option key={area} value={area} />
                    ))}
                  </datalist>
                  {errors.area && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.area.message}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Or type address manually — e.g. Andheri West, Mumbai"
                    className="pl-9"
                    value={addressValue}
                    {...addressField}
                    onBlur={(e) => {
                      addressField.onBlur(e);
                      const text = [areaValue, e.target.value]
                        .filter(Boolean)
                        .join(" ");
                      tryAutoAssignWard(text);
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  GPS coordinates are auto-filled when you click "Auto-Fetch".
                  You can also type your address manually.
                </p>
                {errors.address && (
                  <p className="text-xs text-destructive">
                    {errors.address.message}
                  </p>
                )}

                {/* Ward */}
                <div>
                  <Label className="mb-1 block">Ward</Label>
                  <Select
                    value={wardValue}
                    onValueChange={(v) => {
                      setWardHint("");
                      setValue("ward", v, { shouldValidate: true });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your ward" />
                    </SelectTrigger>
                    <SelectContent>
                      {WARDS.map((w) => (
                        <SelectItem key={w} value={w}>
                          {w}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.ward && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.ward.message}
                    </p>
                  )}
                  {wardHint && !errors.ward && (
                    <p className="text-xs text-emerald-600 mt-1">{wardHint}</p>
                  )}
                  <input
                    type="hidden"
                    {...register("ward", {
                      required: "Ward is required",
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 4. Photo Evidence */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>4. Photo Evidence</span>
                  {photos.length > 0 && (
                    <Badge variant="secondary">{photos.length}/5 photos</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Photo previews */}
                {photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border"
                      >
                        <img
                          src={src}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload / Camera buttons */}
                {photos.length < 5 && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Use Camera */}
                    <button
                      type="button"
                      onClick={openCamera}
                      className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-5 hover:border-primary/50 hover:bg-muted/50 transition-all"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Use Camera</span>
                      <span className="text-xs text-muted-foreground">
                        Take a live photo
                      </span>
                    </button>

                    {/* Upload from gallery */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-5 hover:border-primary/50 hover:bg-muted/50 transition-all"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <ImagePlus className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Upload Photo</span>
                      <span className="text-xs text-muted-foreground">
                        JPG, PNG up to 10MB
                      </span>
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <p className="text-xs text-muted-foreground text-center">
                  {photos.length > 0
                    ? "✓ Adding photos earns 2× reward points!"
                    : "Adding photos earns 2× reward points · Max 5 photos"}
                </p>
              </CardContent>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting || !citizen}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
            {!citizen && (
              <p className="text-center text-sm text-muted-foreground">
                Please{" "}
                <button
                  type="button"
                  onClick={() => navigate("/citizen-login")}
                  className="text-primary underline"
                >
                  login
                </button>{" "}
                to submit
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </>
  );
}
