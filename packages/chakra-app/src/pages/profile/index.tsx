import { Caip10Link } from "@ceramicnetwork/stream-caip10-link";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Image,
  Input,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { IDX } from "@ceramicstudio/idx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMoralis } from "react-moralis";
import { makeCeramicClient } from "../../utils";

const ProfilePage: React.FunctionComponent = () => {
  const [did, setDid] = useState<string>();
  // TODO: store images on Web3.storage
  const [imageURL, setImageURL] = useState<string>();
  const [backgroundURL, setBackgroundURL] = useState<string>();
  const image = useRef<HTMLImageElement>(null);
  const background = useRef<HTMLImageElement>(null);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm();
  const { user } = useMoralis();

  const onFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      const img = image.current as HTMLImageElement;
      const bg = background.current as HTMLImageElement;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        console.log(reader.result); // eslint-disable-line no-console
        if (input.name === "image") {
          img.src = reader.result as string;
        }
        if (input.name === "background") {
          bg.src = reader.result as string;
        }
      });
      reader.readAsDataURL(file);
    },
    []
  );

  useEffect(() => {
    // fetch from IDX
    (async () => {
      if (user && user.attributes.ethAddress) {
        const { ceramic, idx } = await makeCeramicClient(
          user.attributes.ethAddress
        );
        const caip10 = await Caip10Link.fromAccount(
          ceramic,
          `${user.attributes.ethAddress}@eip155:1`
        );
        if (caip10.did) {
          setDid(caip10.did);
          const result = await idx.get("basicProfile", caip10.did);
          Object.entries(result as Record<string, unknown>).forEach(
            ([key, object]) => {
              let value = object;
              if (["image", "background"].includes(key)) {
                const {
                  original: { src: url },
                } = value as Record<string, Record<string, string>>;
                value = url;
                const match = url.match(/^ipfs:\/\/(.+)$/);
                if (match) {
                  const ipfsUrl = `//ipfs.io/ipfs/${match[1]}`;
                  value = ipfsUrl;
                }
                if (key === "image") {
                  setImageURL(value as string);
                }
                if (key === "background") {
                  setBackgroundURL(value as string);
                }
              } else {
                setValue(key, value);
              }
            }
          );
        }
      }
    })();
  }, [user?.attributes.ethAddress, setValue]);

  const onSubmit = async (values: Record<string, unknown>) => {
    console.log(values);
    const { idx } = await makeCeramicClient(user?.attributes.ethAddress);
    await idx.merge("basicProfile", values);
    // const formData = new FormData();
    // const [imageFile] = values.image as File[];
    // const [backgroundFile] = values.background as File[];
    // if (image || background) {
    //   if (image) {
    //     formData.append("image", imageFile);
    //   }
    //   if (background) {
    //     formData.append("background", backgroundFile);
    //   }
    //   const result = await fetch(`/api/storage`, {
    //     method: "POST",
    //     body: formData,
    //     credentials: "include",
    //   });
    //   console.log({ result });
    //   const cids = await result.json();
    //   const refs = { image: image.current, background: background.current } as {
    //     image: HTMLImageElement | null;
    //     background: HTMLImageElement | null;
    //   };
    //   ["image", "background"].forEach((key) => {
    //     if (cids[key]) {
    //       values[key] = {
    //         original: {
    //           src: `ipfs://${cids[key]}`,
    //           mimeType: "image/*",
    //           width: refs[key as "image" | "background"]?.width,
    //           height: refs[key as "image" | "background"]?.height,
    //         },
    //       };
    //     } else {
    //       delete values[key];
    //     }
    //   });
    //   if (ceramic?.did) {
    //     await ceramic.did.authenticate();
    //   }
    //   console.log(values);
    //   await idx?.set("basicProfile", values);
    // }
  };
  return (
    <Stack as="form" onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={errors.name}>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          placeholder="name"
          {...register("name", {
            maxLength: {
              value: 150,
              message: "Maximum length should be 150",
            },
          })}
        />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>
      {/* <FormControl isInvalid={errors.image}>
        <FormLabel htmlFor="image">Profile Image</FormLabel>
        <Image ref={image} src={imageURL} />
        <Input
          name="image"
          type="file"
          defaultValue=""
          onChange={onFileChange}
          placeholder="image"
          ref={register}
          {...register("image")}
        />
        <FormErrorMessage>
          {errors.image && errors.image.message}
        </FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={errors.background}>
        <FormLabel htmlFor="background">Header Background</FormLabel>
        <Image ref={background} src={backgroundURL} />
        <Input
          type="file"
          defaultValue=""
          onChange={onFileChange}
          placeholder="background"
          {...register("background")}
        />
        <FormErrorMessage>
          {errors.background && errors.background.message}
        </FormErrorMessage>
      </FormControl> */}
      <FormControl isInvalid={errors.description}>
        <FormLabel htmlFor="description">Description</FormLabel>
        <Textarea
          placeholder="description"
          {...register("description", {
            maxLength: {
              value: 420,
              message: "Maximum length should be 420",
            },
          })}
        />
        <FormErrorMessage>
          {errors.description && errors.description.message}
        </FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={errors.emoji}>
        <FormLabel htmlFor="description">Emoji</FormLabel>
        <Input
          placeholder="emoji"
          {...register("emoji", {
            maxLength: 2,
          })}
        />
        <FormErrorMessage>
          {errors.emoji && errors.emoji.message}
        </FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={errors.birthDate}>
        <FormLabel htmlFor="description">Birthdate</FormLabel>
        <Input type="date" placeholder="birthDate" {...register("birthDate")} />
        <FormErrorMessage>
          {errors.birthDate && errors.birthDate.message}
        </FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={errors.url}>
        <FormLabel htmlFor="description">Website</FormLabel>
        <Input
          placeholder="url"
          {...register("url", {
            maxLength: 240,
          })}
        />
        <FormErrorMessage>{errors.url && errors.url.message}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={errors.homeLocation}>
        <FormLabel htmlFor="description">Location</FormLabel>
        <Input
          placeholder="homeLocation"
          {...register("homeLocation", {
            maxLength: 140,
          })}
        />
        <FormErrorMessage>
          {errors.homeLocation && errors.homeLocation.message}
        </FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={errors.residenceCountry}>
        <FormLabel htmlFor="description">Country Code</FormLabel>
        <Input
          placeholder="residenceCountry"
          {...register("residenceCountry", {
            maxLength: 2,
          })}
        />
        <FormErrorMessage>
          {errors.residenceCountry && errors.residenceCountry.message}
        </FormErrorMessage>
      </FormControl>
      <Button mt={4} colorScheme="teal" isLoading={isSubmitting} type="submit">
        Save
      </Button>
    </Stack>
  );
};

export default ProfilePage;
