"use client";

import React from "react";
import {
  ProgressBar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import { ActionCell, HeaderButton } from "@/app/(app)/bulk-unsubscribe/common";
import { RowProps } from "@/app/(app)/bulk-unsubscribe/types";

export function BulkUnsubscribeDesktop(props: {
  tableRows?: React.ReactNode;
  sortColumn: "emails" | "unread" | "unarchived";
  setSortColumn: (sortColumn: "emails" | "unread" | "unarchived") => void;
}) {
  const { tableRows, sortColumn, setSortColumn } = props;

  return (
    <Table className="mt-4">
      <TableHead>
        <TableRow>
          <TableHeaderCell className="pl-6">
            <span className="text-sm font-medium">From</span>
          </TableHeaderCell>
          <TableHeaderCell>
            <HeaderButton
              sorted={sortColumn === "emails"}
              onClick={() => setSortColumn("emails")}
            >
              Emails
            </HeaderButton>
          </TableHeaderCell>
          <TableHeaderCell>
            <HeaderButton
              sorted={sortColumn === "unread"}
              onClick={() => setSortColumn("unread")}
            >
              Read
            </HeaderButton>
          </TableHeaderCell>
          <TableHeaderCell>
            <HeaderButton
              sorted={sortColumn === "unarchived"}
              onClick={() => setSortColumn("unarchived")}
            >
              Archived
            </HeaderButton>
          </TableHeaderCell>
          <TableHeaderCell />
        </TableRow>
      </TableHead>
      <TableBody>{tableRows}</TableBody>
    </Table>
  );
}

export function BulkUnsubscribeRowDesktop({
  item,
  refetchPremium,
  selected,
  onSelectRow,
  onDoubleClick,
  hasUnsubscribeAccess,
  mutate,
  onOpenNewsletter,
  userGmailLabels,
  openPremiumModal,
  userEmail,
}: RowProps) {
  const readPercentage = (item.readEmails / item.value) * 100;
  const archivedEmails = item.value - item.inboxEmails;
  const archivedPercentage = (archivedEmails / item.value) * 100;

  return (
    <TableRow
      key={item.name}
      className={selected ? "bg-blue-50" : undefined}
      aria-selected={selected || undefined}
      data-selected={selected || undefined}
      onMouseEnter={onSelectRow}
      onDoubleClick={onDoubleClick}
    >
      <TableCell className="max-w-[250px] truncate pl-6 min-[1550px]:max-w-[300px] min-[1650px]:max-w-none">
        {item.name}
      </TableCell>
      <TableCell>{item.value}</TableCell>
      <TableCell>
        <div className="hidden xl:block">
          <ProgressBar
            label={`${Math.round(readPercentage)}%`}
            value={readPercentage}
            tooltip={`${item.readEmails} read. ${
              item.value - item.readEmails
            } unread.`}
            color="blue"
            className="w-[150px]"
          />
        </div>
        <div className="xl:hidden">{Math.round(readPercentage)}%</div>
      </TableCell>
      <TableCell>
        <div className="hidden 2xl:block">
          <ProgressBar
            label={`${Math.round(archivedPercentage)}%`}
            value={archivedPercentage}
            tooltip={`${archivedEmails} archived. ${item.inboxEmails} unarchived.`}
            color="blue"
            className="w-[150px]"
          />
        </div>
        <div className="2xl:hidden">{Math.round(archivedPercentage)}%</div>
      </TableCell>
      <TableCell className="flex justify-end gap-2 p-2">
        <ActionCell
          item={item}
          hasUnsubscribeAccess={hasUnsubscribeAccess}
          mutate={mutate}
          refetchPremium={refetchPremium}
          onOpenNewsletter={onOpenNewsletter}
          selected={selected}
          userGmailLabels={userGmailLabels}
          openPremiumModal={openPremiumModal}
          userEmail={userEmail}
        />
      </TableCell>
    </TableRow>
  );
}
