import { AlertDialog, Button, Input, Label, TextArea } from "@heroui/react";
import { ListOrdered, ListPlus } from "lucide-react";

export function CreateTaskButton() {
  return (
    <>
      <AlertDialog>
        <Button>
          <ListPlus /> Create
        </Button>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog className="sm:max-w-[400px]">
              <AlertDialog.CloseTrigger />
              <AlertDialog.Header>
                <AlertDialog.Icon>
                  <ListOrdered />
                </AlertDialog.Icon>
                <AlertDialog.Heading>
                  Create new Task?
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <div className="flex gap-2 flex-col p-1">
                  <div className="flex flex-col gap-1">
                    <Label>Name</Label>
                    <Input variant="secondary" type="text" placeholder="Do Task" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Description</Label>
                    <TextArea
                      variant="secondary"
                      placeholder="Do task at time with consistency"
                      fullWidth
                      cols={5}
                    />
                  </div>
                  
                </div>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="tertiary">
                  Discard
                </Button>
                <Button slot="close">Create</Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </>
  );
}
