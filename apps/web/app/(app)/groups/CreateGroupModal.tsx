"use client";

import { useCallback, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Modal, useModal } from "@/components/Modal";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { toastSuccess, toastError } from "@/components/Toast";
import { isErrorMessage } from "@/utils/error";
import {
  createGroupAction,
  createNewsletterGroupAction,
  createReceiptGroupAction,
} from "@/utils/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateGroupBody, createGroupBody } from "@/utils/actions-validation";

export function CreateGroupModalButton() {
  const { isModalOpen, openModal, closeModal } = useModal();

  return (
    <>
      <Button onClick={openModal}>Create group</Button>
      <Modal isOpen={isModalOpen} hideModal={closeModal} title="Create Group">
        <div className="mt-4">
          <CreateGroupForm closeModal={closeModal} />
        </div>
      </Modal>
    </>
  );
}

function CreateGroupForm({ closeModal }: { closeModal: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateGroupBody>({
    resolver: zodResolver(createGroupBody),
  });

  const onSubmit: SubmitHandler<CreateGroupBody> = useCallback(
    async (data) => {
      const res = await createGroupAction(data);
      if (isErrorMessage(res))
        toastError({ description: `There was an error creating the group.` });
      else {
        toastSuccess({ description: `Group created!` });
        closeModal();
      }
    },
    [closeModal],
  );

  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [receiptsLoading, setReceiptsLoading] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-x-2">
        <Button
          loading={newsletterLoading}
          onClick={async () => {
            setNewsletterLoading(true);
            const res = await createNewsletterGroupAction({
              name: "Newsletter",
            });
            if (isErrorMessage(res))
              toastError({
                description: `There was an error creating the group.`,
              });
            else {
              toastSuccess({ description: `Group created!` });
              closeModal();
            }
            setNewsletterLoading(false);
          }}
          color="white"
        >
          Newsletter
        </Button>
        <Button
          color="white"
          loading={receiptsLoading}
          onClick={async () => {
            setReceiptsLoading(true);
            const res = await createReceiptGroupAction({ name: "Receipt" });
            if (isErrorMessage(res))
              toastError({
                description: `There was an error creating the group.`,
              });
            else {
              toastSuccess({ description: `Group created!` });
              closeModal();
            }
            setReceiptsLoading(false);
          }}
        >
          Receipt
        </Button>
      </div>

      <Input
        type="text"
        name="name"
        label="Name"
        placeholder="eg. Newsletter, Receipt, VIP"
        registerProps={register("name", { required: true })}
        error={errors.name}
      />
      <Input
        type="text"
        as="textarea"
        rows={3}
        name="prompt"
        label="Prompt"
        placeholder="eg. Anyone I've done a demo call with."
        explainText="Tell our AI how to populate the group."
        registerProps={register("prompt", { required: true })}
        error={errors.prompt}
      />
      <Button type="submit" loading={isSubmitting}>
        Create
      </Button>
    </form>
  );
}
