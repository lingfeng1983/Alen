"""
置顶便签工具 - 极简版
修复删除按钮功能
"""
import tkinter as tk
from tkinter import ttk, messagebox
import json
import os
from datetime import datetime


class NoteCard(tk.Frame):
    """便签卡片组件 - 极简版"""
    def __init__(self, parent, note_data, index, app):
        super().__init__(parent, bg="#ffffff", relief=tk.FLAT, bd=0)
        self.note_data = note_data
        self.index = index
        self.app = app
        self.is_expanded = False
        
        self.category_colors = {
            "常用": "#4CAF50",
            "地址": "#2196F3", 
            "电话": "#FF9800",
            "邮箱": "#9C27B0",
            "账号": "#F44336",
            "其他": "#607D8B"
        }
        
        self.configure(highlightbackground="#ddd", highlightthickness=1)
        self.create_preview()
        
    def get_scaled_font_size(self, base_size):
        """计算缩放字体，但保持最小值"""
        scaled = int(base_size * self.app.font_scale)
        min_sizes = {7: 7, 8: 8, 9: 9, 10: 10, 11: 11}
        return max(scaled, min_sizes.get(base_size, base_size))
        
    def create_preview(self):
        """创建预览模式"""
        for widget in self.winfo_children():
            widget.destroy()
        
        preview_frame = tk.Frame(self, bg="#ffffff")
        preview_frame.pack(fill=tk.BOTH, expand=True, padx=12, pady=8)
        
        # 顶部行
        top_row = tk.Frame(preview_frame, bg="#ffffff")
        top_row.pack(fill=tk.X, pady=(0, 6))
        
        # 分类标签
        category = self.note_data.get("category", "常用")
        color = self.category_colors.get(category, "#607D8B")
        
        category_frame = tk.Frame(top_row, bg=color)
        category_frame.pack(side=tk.LEFT, padx=(0, 8))
        
        tk.Label(
            category_frame,
            text=f" {category} ",
            bg=color,
            fg="white",
            font=("Microsoft YaHei", self.get_scaled_font_size(8), "bold"),
            padx=6,
            pady=2
        ).pack()
        
        # 标题
        title = self.note_data.get("title", "未命名")
        self.title_label = tk.Label(
            top_row,
            text=title,
            font=("Microsoft YaHei", self.get_scaled_font_size(10), "bold"),
            fg="#2c3e50",
            bg="#ffffff",
            anchor=tk.W
        )
        self.title_label.pack(side=tk.LEFT, fill=tk.X, expand=True)
        
        # 删除按钮 - 独立处理
        self.delete_btn = tk.Label(
            top_row,
            text="✕",
            font=("Arial", self.get_scaled_font_size(14)),
            fg="#95a5a6",
            bg="#ffffff",
            cursor="hand2",
            padx=5
        )
        self.delete_btn.pack(side=tk.RIGHT)
        
        # 删除按钮事件 - 单独绑定，不参与卡片点击
        self.delete_btn.bind("<Button-1>", self.on_delete_click,  add="+")
        self.delete_btn.bind("<Enter>", lambda e: self.delete_btn.config(fg="#e74c3c"))
        self.delete_btn.bind("<Leave>", lambda e: self.delete_btn.config(fg="#95a5a6"))
        
        # 内容预览
        content = self.note_data.get("content", "")
        if content:
            preview_text = content[:100] + "..." if len(content) > 100 else content
            
            self.content_label = tk.Label(
                preview_frame,
                text=preview_text,
                font=("Microsoft YaHei", self.get_scaled_font_size(9)),
                fg="#7f8c8d",
                bg="#ffffff",
                justify=tk.LEFT,
                anchor=tk.W,
                wraplength=int(420 * self.app.font_scale)
            )
            self.content_label.pack(fill=tk.X, pady=(0, 4))
        else:
            self.content_label = tk.Label(
                preview_frame,
                text="点击编辑内容...",
                font=("Microsoft YaHei", self.get_scaled_font_size(9)),
                fg="#bdc3c7",
                bg="#ffffff"
            )
            self.content_label.pack(fill=tk.X, pady=(0, 4))
        
        # 卡片其他区域点击展开
        preview_frame.bind("<Button-1>", lambda e: self.expand_card())
        top_row.bind("<Button-1>", lambda e: self.expand_card())
        category_frame.bind("<Button-1>", lambda e: self.expand_card())
        self.title_label.bind("<Button-1>", lambda e: self.expand_card())
        self.content_label.bind("<Button-1>", lambda e: self.expand_card())
        
        # 设置光标
        preview_frame.config(cursor="hand2")
        top_row.config(cursor="hand2")
        category_frame.config(cursor="hand2")
        self.title_label.config(cursor="hand2")
        self.content_label.config(cursor="hand2")
        
    def on_delete_click(self, event):
        """删除按钮点击事件"""
        self.delete_card()
        return "break"  # 阻止事件传播
        
    def create_expanded(self):
        """创建展开模式"""
        for widget in self.winfo_children():
            widget.destroy()
        
        self.configure(highlightbackground="#3498db", highlightthickness=2)
        
        edit_frame = tk.Frame(self, bg="#ffffff")
        edit_frame.pack(fill=tk.BOTH, expand=True, padx=12, pady=8)
        
        # 顶部：分类 + 复制 + 关闭
        top_bar = tk.Frame(edit_frame, bg="#ffffff")
        top_bar.pack(fill=tk.X, pady=(0, 8))
        
        tk.Label(
            top_bar,
            text="分类",
            font=("Microsoft YaHei", self.get_scaled_font_size(8)),
            fg="#7f8c8d",
            bg="#ffffff"
        ).pack(side=tk.LEFT, padx=(0, 5))
        
        self.category_var = tk.StringVar(value=self.note_data.get("category", "常用"))
        ttk.Combobox(
            top_bar,
            textvariable=self.category_var,
            values=list(self.category_colors.keys()),
            width=8,
            font=("Microsoft YaHei", self.get_scaled_font_size(8)),
            state="readonly"
        ).pack(side=tk.LEFT)
        
        # 复制按钮
        copy_btn = tk.Label(
            top_bar,
            text="📋 复制",
            font=("Microsoft YaHei", self.get_scaled_font_size(9)),
            fg="#27ae60",
            bg="#ffffff",
            cursor="hand2",
            padx=10
        )
        copy_btn.pack(side=tk.RIGHT, padx=(0, 15))
        
        def copy_content(e):
            content = self.content_text.get("1.0", tk.END).strip()
            if content:
                self.app.root.clipboard_clear()
                self.app.root.clipboard_append(content)
                self.app.show_status("✓ 已复制全部内容")
            else:
                self.app.show_status("内容为空")
        
        copy_btn.bind("<Button-1>", copy_content)
        copy_btn.bind("<Enter>", lambda e: copy_btn.config(fg="#2ecc71"))
        copy_btn.bind("<Leave>", lambda e: copy_btn.config(fg="#27ae60"))
        
        # 关闭按钮
        close_btn = tk.Label(
            top_bar,
            text="✕ 关闭",
            font=("Microsoft YaHei", self.get_scaled_font_size(9)),
            fg="#7f8c8d",
            bg="#ffffff",
            cursor="hand2"
        )
        close_btn.pack(side=tk.RIGHT)
        close_btn.bind("<Button-1>", lambda e: self.collapse_card())
        close_btn.bind("<Enter>", lambda e: close_btn.config(fg="#e74c3c"))
        close_btn.bind("<Leave>", lambda e: close_btn.config(fg="#7f8c8d"))
        
        # 标题
        tk.Label(
            edit_frame,
            text="标题",
            font=("Microsoft YaHei", self.get_scaled_font_size(8)),
            fg="#7f8c8d",
            bg="#ffffff"
        ).pack(anchor=tk.W, pady=(0, 3))
        
        self.title_entry = tk.Entry(
            edit_frame,
            font=("Microsoft YaHei", self.get_scaled_font_size(10)),
            relief=tk.FLAT,
            bg="#f8f9fa",
            fg="#2c3e50",
            insertbackground="#3498db"
        )
        self.title_entry.insert(0, self.note_data.get("title", ""))
        self.title_entry.pack(fill=tk.X, pady=(0, 8))
        
        # 内容
        tk.Label(
            edit_frame,
            text="内容",
            font=("Microsoft YaHei", self.get_scaled_font_size(8)),
            fg="#7f8c8d",
            bg="#ffffff"
        ).pack(anchor=tk.W, pady=(0, 3))
        
        text_container = tk.Frame(edit_frame, bg="#f8f9fa")
        text_container.pack(fill=tk.BOTH, expand=True)
        
        scrollbar = tk.Scrollbar(text_container)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.content_text = tk.Text(
            text_container,
            font=("Microsoft YaHei", self.get_scaled_font_size(9)),
            wrap=tk.WORD,
            relief=tk.FLAT,
            bg="#f8f9fa",
            fg="#2c3e50",
            insertbackground="#3498db",
            selectbackground="#3498db",
            selectforeground="white",
            padx=8,
            pady=8,
            yscrollcommand=scrollbar.set,
            height=8
        )
        self.content_text.insert("1.0", self.note_data.get("content", ""))
        self.content_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.config(command=self.content_text.yview)
        
        # 提示
        tk.Label(
            edit_frame,
            text="💡 Ctrl+C 复制选中 | Ctrl+A 全选 | 点击外部自动保存",
            font=("Microsoft YaHei", self.get_scaled_font_size(7)),
            fg="#95a5a6",
            bg="#ffffff"
        ).pack(anchor=tk.E, pady=(6, 0))
                    
    def expand_card(self):
        if not self.is_expanded:
            self.is_expanded = True
            self.create_expanded()
            self.app.collapse_other_cards(self.index)
            
    def collapse_card(self):
        if self.is_expanded:
            self.save_card(show_message=False)
            self.is_expanded = False
            self.configure(highlightbackground="#ddd", highlightthickness=1)
            self.create_preview()
            
    def save_card(self, show_message=True):
        if self.is_expanded:
            self.note_data["title"] = self.title_entry.get() or "未命名"
            self.note_data["content"] = self.content_text.get("1.0", tk.END).strip()
            self.note_data["category"] = self.category_var.get()
            self.app.save_data()
            if show_message:
                self.app.show_status(f"✓ 已保存: {self.note_data['title']}")
                
    def delete_card(self):
        title = self.note_data.get("title", "未命名")
        if messagebox.askyesno("确认删除", f"确定要删除便签 '{title}' 吗?"):
            self.app.delete_note(self.index)
                
    def update_fonts(self):
        if self.is_expanded:
            self.create_expanded()
        else:
            self.create_preview()


class StickyNotesCardApp:
    """极简卡片式便签应用"""
    def __init__(self, root):
        self.root = root
        self.root.title("📝 便签工具")
        
        self.data_file = "sticky_notes_data.json"
        self.config_file = "window_config.json"
        
        self.notes = []
        self.cards = []
        self.font_scale = 1.0
        self.last_width = 0
        
        self.load_data()
        self.load_window_config()
        self.setup_window()
        self.create_ui()
        
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        self.root.bind("<Configure>", self.on_window_resize)
        
    def setup_window(self):
        self.root.attributes("-topmost", True)
        self.root.attributes("-alpha", 0.95)
        self.root.configure(bg="#ecf0f1")
        
    def create_ui(self):
        main_frame = tk.Frame(self.root, bg="#ecf0f1")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=12, pady=12)
        
        # 工具栏
        toolbar = tk.Frame(main_frame, bg="#ffffff")
        toolbar.pack(fill=tk.X, pady=(0, 12))
        
        toolbar_inner = tk.Frame(toolbar, bg="#ffffff")
        toolbar_inner.pack(fill=tk.X, padx=15, pady=10)
        
        # 新建按钮
        new_btn = tk.Frame(toolbar_inner, bg="#3498db", cursor="hand2")
        new_btn.pack(side=tk.LEFT, padx=(0, 15))
        
        tk.Label(
            new_btn,
            text="➕",
            font=("Arial", 14, "bold"),
            fg="white",
            bg="#3498db",
            padx=6,
            pady=4
        ).pack(side=tk.LEFT)
        
        tk.Label(
            new_btn,
            text="新建",
            font=("Microsoft YaHei", 9, "bold"),
            fg="white",
            bg="#3498db",
            padx=8,
            pady=4
        ).pack(side=tk.LEFT)
        
        def on_new_click(e):
            self.new_note()
        
        def on_new_hover(enter):
            color = "#2980b9" if enter else "#3498db"
            new_btn.config(bg=color)
            for widget in new_btn.winfo_children():
                widget.config(bg=color)
        
        for widget in [new_btn] + list(new_btn.winfo_children()):
            widget.bind("<Button-1>", on_new_click)
            widget.bind("<Enter>", lambda e: on_new_hover(True))
            widget.bind("<Leave>", lambda e: on_new_hover(False))
        
        # 透明度
        alpha_frame = tk.Frame(toolbar_inner, bg="#ffffff")
        alpha_frame.pack(side=tk.LEFT)
        
        tk.Label(
            alpha_frame,
            text="透明度",
            font=("Microsoft YaHei", 9),
            fg="#7f8c8d",
            bg="#ffffff"
        ).pack(side=tk.LEFT, padx=(0, 8))
        
        self.alpha_var = tk.DoubleVar(value=0.95)
        ttk.Scale(
            alpha_frame,
            from_=0.3,
            to=1.0,
            orient=tk.HORIZONTAL,
            variable=self.alpha_var,
            command=lambda v: self.root.attributes("-alpha", float(v)),
            length=120
        ).pack(side=tk.LEFT)
        
        # 便签数量
        self.count_label = tk.Label(
            toolbar_inner,
            text=f"共 {len(self.notes)} 条",
            font=("Microsoft YaHei", 9),
            fg="#95a5a6",
            bg="#ffffff"
        )
        self.count_label.pack(side=tk.RIGHT)
        
        # 卡片区域
        canvas_container = tk.Frame(main_frame, bg="#ecf0f1")
        canvas_container.pack(fill=tk.BOTH, expand=True)
        
        self.canvas = tk.Canvas(canvas_container, bg="#ecf0f1", highlightthickness=0, bd=0)
        scrollbar = ttk.Scrollbar(canvas_container, orient=tk.VERTICAL, command=self.canvas.yview)
        
        self.scrollable_frame = tk.Frame(self.canvas, bg="#ecf0f1")
        
        self.canvas_window = self.canvas.create_window(
            (0, 0),
            window=self.scrollable_frame,
            anchor=tk.NW,
            width=self.canvas.winfo_reqwidth()
        )
        
        self.scrollable_frame.bind("<Configure>", lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all")))
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        self.canvas.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        self.canvas.bind_all("<MouseWheel>", lambda e: self.canvas.yview_scroll(int(-1*(e.delta/120)), "units"))
        
        # 状态栏
        status_bar = tk.Frame(main_frame, bg="#ffffff")
        status_bar.pack(fill=tk.X, pady=(12, 0))
        
        self.status_label = tk.Label(
            status_bar,
            text="就绪",
            font=("Microsoft YaHei", 9),
            fg="#7f8c8d",
            bg="#ffffff",
            anchor=tk.W,
            padx=15,
            pady=8
        )
        self.status_label.pack(fill=tk.X)
        
        # 快捷键
        self.root.bind('<Control-n>', lambda e: self.new_note())
        self.root.bind('<Control-q>', lambda e: self.on_closing())
        
        self.refresh_cards()
        
    def calculate_font_scale(self, width):
        base_width = 480
        if width < 360:
            return 1.0
        elif width > 700:
            return min(1.4, width / base_width)
        else:
            return max(1.0, width / base_width)
    
    def on_window_resize(self, event):
        if event.widget == self.root:
            canvas_width = self.canvas.winfo_width()
            if canvas_width > 1:
                self.canvas.itemconfig(self.canvas_window, width=canvas_width)
            
            new_width = event.width
            if abs(new_width - self.last_width) > 50:
                self.last_width = new_width
                old_scale = self.font_scale
                self.font_scale = self.calculate_font_scale(new_width)
                
                if abs(old_scale - self.font_scale) > 0.05:
                    for card in self.cards:
                        card.update_fonts()
        
    def new_note(self):
        note = {
            "title": f"新便签 {len(self.notes) + 1}",
            "content": "",
            "category": "常用",
            "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        self.notes.insert(0, note)  # 插入到列表开头
        self.save_data()
        self.refresh_cards()
        
        # 滚动到顶部显示新便签
        self.canvas.yview_moveto(0)
        
        if self.cards:
            self.cards[0].expand_card()
        
        self.show_status("✨ 已创建新便签")
        
    def delete_note(self, index):
        if 0 <= index < len(self.notes):
            title = self.notes[index]["title"]
            del self.notes[index]
            self.save_data()
            self.refresh_cards()
            self.show_status(f"🗑️ 已删除: {title}")
            
    def collapse_other_cards(self, current_index):
        for i, card in enumerate(self.cards):
            if i != current_index and card.is_expanded:
                card.collapse_card()
                
    def refresh_cards(self):
        # 清除scrollable_frame中的所有子组件（包括提示文字）
        for widget in self.scrollable_frame.winfo_children():
            widget.destroy()
        self.cards.clear()
        
        for i, note in enumerate(self.notes):
            card = NoteCard(self.scrollable_frame, note, i, self)
            card.pack(fill=tk.BOTH, expand=True, pady=4)
            self.cards.append(card)
        
        if hasattr(self, 'count_label'):
            self.count_label.config(text=f"共 {len(self.notes)} 条")
        
        if not self.notes:
            tk.Label(
                self.scrollable_frame,
                text="📝 点击\"新建\"开始使用",
                font=("Microsoft YaHei", 12),
                fg="#bdc3c7",
                bg="#ecf0f1"
            ).pack(pady=100)
            
    def show_status(self, message):
        self.status_label.config(text=message, fg="#27ae60")
        self.root.after(3000, lambda: self.status_label.config(text="就绪", fg="#7f8c8d"))
        
    def load_data(self):
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    self.notes = json.load(f)
        except Exception as e:
            messagebox.showerror("加载错误", f"加载数据失败: {str(e)}")
            self.notes = []
            
    def save_data(self):
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.notes, f, ensure_ascii=False, indent=2)
        except Exception as e:
            messagebox.showerror("保存错误", f"保存数据失败: {str(e)}")
            
    def load_window_config(self):
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                    self.root.geometry(config.get('geometry', '480x650'))
                    self.alpha_var = tk.DoubleVar(value=config.get('alpha', 0.95))
                    return
        except:
            pass
        self.root.geometry("480x650")
        
    def save_window_config(self):
        try:
            config = {
                'geometry': self.root.geometry(),
                'alpha': self.root.attributes("-alpha")
            }
            with open(self.config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2)
        except:
            pass
            
    def on_closing(self):
        for card in self.cards:
            if card.is_expanded:
                card.save_card(show_message=False)
        self.save_window_config()
        self.root.destroy()


def main():
    root = tk.Tk()
    app = StickyNotesCardApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
