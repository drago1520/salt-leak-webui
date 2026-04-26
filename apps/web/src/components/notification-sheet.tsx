'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePushSubscribe } from '@/hooks/use-push-subscribe';
import { agGridTheme } from '@/lib/theme';
import { trpc } from '@/lib/trpc-client';
import { AllCommunityModule, type ICellRendererParams } from 'ag-grid-community';
import { AgGridProvider, AgGridReact } from 'ag-grid-react';
import { Archive, Bell, Loader2 } from 'lucide-react';
import { useEffect, useRef, useTransition } from 'react';
import { toast } from 'sonner';

function ArchiveCell({ data, api }: ICellRendererParams) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex h-full items-center justify-center">
      <Button
        variant="ghost"
        size="icon"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await trpc.notifications.archive.mutate({ id: String((data as { id: string }).id) });
            api.applyTransaction({ remove: [data] });
          })
        }
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />}
      </Button>
    </div>
  );
}

export function NotificationSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const inboxRef = useRef<AgGridReact>(null);
  usePushSubscribe()
  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_URL}?token=${process.env.NEXT_PUBLIC_NOTIFICATIONS_WS_TOKEN}`,
    );
    ws.onmessage = e => {
      const data = JSON.parse(e.data);
      toast.error(data.message);
      inboxRef.current?.api.applyTransaction({ add: [data], addIndex: 0 });
    };
    return () => ws.close();
  }, []);

  async function onInboxReady() {
    const { rows } = await trpc.notifications.list.query({
      startRow: 0,
      endRow: 500,
      sortModel: [{ colId: 'id', sort: 'desc' as const }],
      filterModel: {},
    });
    inboxRef.current?.api.applyTransaction({ add: rows });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-125 flex-col sm:max-w-125">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell /> Notifications
          </SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="inbox" className="flex flex-1 flex-col" >
          <TabsList variant="line">
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="inbox" className="flex flex-1 flex-col">
            <Button
              variant="outline"
              size="sm"
              className="my-2"
              onClick={async () => {
                await trpc.notifications.archiveAll.mutate();
                const allRows: object[] = [];
                inboxRef.current?.api.forEachNode(node => allRows.push(node.data));
                inboxRef.current?.api.applyTransaction({ remove: allRows });
              }}
            >
              <Archive /> Archive all
            </Button>
            <AgGridProvider modules={[AllCommunityModule]}>
              <div className="flex-1">
                <AgGridReact
                  ref={inboxRef}
                  theme={agGridTheme}
                  onGridReady={onInboxReady}
                  getRowId={params => String(params.data.id)}
                  columnDefs={[
                    { field: 'message', flex: 1, wrapText: true },
                    { width: 48, cellRenderer: ArchiveCell },
                  ]}
                  rowHeight={80}
                  headerHeight={0}
                  suppressRowVirtualisation
                />
              </div>
            </AgGridProvider>
          </TabsContent>
          <TabsContent value="archived" className="flex-1">
            <AgGridProvider modules={[AllCommunityModule]}>
              <div className="h-full">
                <AgGridReact
                  theme={agGridTheme}
                  getRowId={params => String((params.data as unknown as { id: string }).id)}
                  columnDefs={[{ field: 'message', flex: 1, wrapText: true }]}
                  rowHeight={80}
                  headerHeight={0}
                  rowModelType="infinite"
                  datasource={{
                    async getRows({ startRow, endRow, sortModel, filterModel, successCallback, failCallback }) {
                      try {
                        const { rows, lastRow } = await trpc.notifications.listArchived.query({ startRow, endRow, sortModel: [{ colId: 'id', sort: 'desc' }, ...sortModel], filterModel });
                        successCallback(rows, lastRow);
                      } catch {
                        failCallback();
                      }
                    },
                  }}
                />
              </div>
            </AgGridProvider>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
