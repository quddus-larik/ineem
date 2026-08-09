"use client";

import { Button, Input, Modal } from "@heroui/react";
import {
  DownloadIcon,
  MicrosoftExcelLogoIcon,
  TableIcon,
} from "@phosphor-icons/react";
import * as XLSX from "xlsx";

export default function ExportDataButton({
  data,
  name,
}: {
  data: object[];
  name: string;
}) {
  const ObjectKeys = Object.keys(data[0]);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, name);
    XLSX.writeFile(wb, `${name.toLowerCase()}.xlsx`);
  };

  return (
    <Modal>
      <Button>
        <MicrosoftExcelLogoIcon />
        Export as Excel
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger /> {/* Optional: Close button */}
            <Modal.Header>
              <Modal.Icon>
                <TableIcon />
              </Modal.Icon>
              <Modal.Heading>Export as Excel Sheet</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-1">
              <div className="grid grid-cols-2 gap-2">
                {ObjectKeys.map((itm, idx) => (
                  <Input defaultValue={itm} key={idx} />
                ))}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={exportToExcel}>Export</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
